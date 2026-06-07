import { Injectable, signal } from '@angular/core';
import { AnimationBuilder } from '../../core/src';
import { CardMoveAnimation } from '../../core/src/animations/CardMoveAnimation.ts';
import type { CardAnimationServiceOptions, CardAnimationServiceContract } from '../types';

/**
 * Angular-сервис для анимации движения карточек (FLIP).
 *
 * Предоставлять на уровне компонента через `providers: [CardAnimationService]` —
 * каждый компонент получает независимый экземпляр с отдельным AnimationBuilder.
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
 *     this.anim.snapshot(this.cardEls().map(r => r.nativeElement));
 *     this.cards.update(arr => shuffleArr(arr));
 *     await this.anim.animateMove(this.cardEls().map(r => r.nativeElement));
 *   }
 * }
 * ```
 */
@Injectable()
export class CardAnimationService implements CardAnimationServiceContract {
	readonly #builder = new AnimationBuilder().use(CardMoveAnimation);

	/** Angular Signal: true пока идёт анимация. Читать как `isAnimating()`. */
	readonly isAnimating = signal(false);

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