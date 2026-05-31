import { Injector, afterNextRender, inject, signal } from '@angular/core';
import { AnimationBuilder } from '../../core/src';
import type { CardAnimationServiceOptions, CardAnimationServiceContract, NextRenderFn } from '../types';

/**
 * Реализация по умолчанию: ждёт фазу `read` следующего Angular render-цикла.
 * Null-check выполняется в `animate()` до вызова — здесь injector гарантированно non-null.
 */
const defaultNextRender: NextRenderFn = (injector: Injector | null) =>
	new Promise<void>(resolve => {
		afterNextRender({ read: resolve }, { injector: injector as Injector });
	});

/**
 * Захватывает Injector из текущего injection context.
 * Возвращает null если вызван вне Angular DI (например, в тестах через `new`).
 */
function captureInjector(): Injector | null {
	try {
		return inject(Injector);
	} catch {
		return null;
	}
}

/**
 * Angular-сервис для анимации движения карточек (FLIP).
 *
 * Предоставлять на уровне компонента через `providers: [CardAnimationService]` —
 * каждый компонент получает независимый экземпляр с отдельным AnimationBuilder.
 *
 * ## Два уровня API
 *
 * ### Высокоуровневый (рекомендуется)
 * Метод `animate()` сам захватывает render-цикл Angular — `Injector` и
 * `afterNextRender` скрыты внутри сервиса:
 *
 * @example
 * ```ts
 * @Component({ providers: [CardAnimationService] })
 * class CardListComponent {
 *   private readonly anim = inject(CardAnimationService);
 *   readonly cards = signal([...]);
 *   readonly cardEls = viewChildren<ElementRef<HTMLElement>>('card');
 *
 *   async shuffle() {
 *     await this.anim.animate(
 *       () => this.cardEls().map(r => r.nativeElement),
 *       () => this.cards.update(arr => shuffleArr(arr)),
 *     );
 *   }
 * }
 * ```
 *
 * ### Низкоуровневый (ручной контроль)
 * `snapshot()` + `animateMove()` остаются доступны для нестандартных сценариев,
 * ванильного JS или когда render-цикл управляется снаружи.
 *
 * ## Тестирование
 * Передай кастомный `nextRender` в конструктор — `vi.mock` не нужен:
 *
 * @example
 * ```ts
 * const service = new CardAnimationService(() => Promise.resolve());
 * ```
 */
export class CardAnimationService implements CardAnimationServiceContract {
	readonly #builder = new AnimationBuilder();
	readonly #injector: Injector | null;

	/** Angular Signal: true пока идёт анимация. Читать как `isAnimating()`. */
	readonly isAnimating = signal(false);

	/**
	 * Высокоуровневый метод: делает снимок, вызывает updateState,
	 * ждёт Angular render-цикл (фаза `read`), затем запускает FLIP-анимацию.
	 *
	 * `getElements` вызывается дважды:
	 * - до `updateState` — чтобы снять позиции «до»
	 * - после render — чтобы получить актуальные DOM-узлы «после»
	 *
	 * Требует Angular DI-контекста (`providers: [CardAnimationService]` в компоненте).
	 */
	readonly animate: (
		getElements: () => Iterable<HTMLElement>,
		updateState: () => void,
	) => Promise<void>;

	constructor(nextRender?: NextRenderFn) {
		this.#injector = captureInjector();

		// Inline-тип вместо алиаса — обход ограничения typescript-eslint
		// с разрешением типов функциональных параметров в замыканиях.
		const fn: (injector: Injector | null) => Promise<void> =
			nextRender ?? defaultNextRender;

		// Инжектор нужен только дефолтной реализации (afterNextRender).
		// Кастомный nextRender (например, в тестах) сам управляет жизненным циклом.
		const requiresInjector = nextRender === undefined;

		this.animate = async (getElements, updateState): Promise<void> => {
			if (this.isAnimating()) {
				console.warn('[CardAnimationService] animate() вызван во время активной анимации — пропускаем');
				return;
			}

			const injector = this.#injector;
			if (requiresInjector && !injector) {
				throw new Error(
					'[CardAnimationService] animate() требует Angular DI-контекста. ' +
					'Добавьте providers: [CardAnimationService] в декоратор компонента.',
				);
			}

			this.snapshot(getElements());
			updateState();
			await fn(injector);
			await this.animateMove(getElements());
		};
	}

	/** Применить опции (duration, easing, stagger). */
	configure(options: CardAnimationServiceOptions): void {
		if (options.duration !== undefined) this.#builder.withDuration(options.duration);
		if (options.easing !== undefined) this.#builder.withEasing(options.easing);
		if (options.stagger !== undefined) this.#builder.withStagger(options.stagger);
	}

	/** Делает снимок позиций карточек до изменения DOM (шаг First). */
	snapshot(cards: Iterable<HTMLElement>): void {
		this.#builder.snapshot(cards);
	}

	/** Запускает анимацию движения карточек после изменения DOM (шаги Last→Invert→Play). */
	async animateMove(cards: Iterable<HTMLElement>): Promise<void> {
		this.isAnimating.set(true);
		try {
			await this.#builder.buildAnimation(cards).play();
		} finally {
			this.isAnimating.set(false);
		}
	}
}
