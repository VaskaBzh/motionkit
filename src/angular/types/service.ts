import type { Injector, Signal } from '@angular/core';
import type { CardMoveOptions } from '../../core/src';

/** Опции настройки CardAnimationService. */
export interface CardAnimationServiceOptions extends CardMoveOptions {
	stagger?: number;
}

/**
 * Функция ожидания следующего Angular render-цикла.
 *
 * По умолчанию реализована через `afterNextRender({ read })` из `@angular/core`.
 * В тестах замените на `() => Promise.resolve()` — никакого `vi.mock` не нужно:
 *
 * @example
 * ```ts
 * // В тесте:
 * const service = new CardAnimationService(() => Promise.resolve());
 * ```
 */
export type NextRenderFn = (injector: Injector | null) => Promise<void>;

/** Публичный интерфейс CardAnimationService. */
export interface CardAnimationServiceContract {
	/** Angular Signal: true пока идёт анимация. Читать как isAnimating(). */
	readonly isAnimating: Signal<boolean>;
	/** Применить опции (duration, easing, stagger). */
	configure(options: CardAnimationServiceOptions): void;
	/** Делает снимок позиций карточек до изменения DOM. */
	snapshot(cards: Iterable<HTMLElement>): void;
	/** Запускает анимацию движения карточек. Вызывать после изменения DOM. */
	animateMove(cards: Iterable<HTMLElement>): Promise<void>;
	/**
	 * Высокоуровневый метод: делает снимок позиций, вызывает updateState,
	 * ждёт Angular render-цикл (фаза read), затем запускает FLIP-анимацию.
	 *
	 * Требует Angular DI-контекста — сервис должен быть создан через
	 * `providers: [CardAnimationService]` в компоненте.
	 *
	 * @param getElements - колбэк, возвращающий актуальные элементы (вызывается дважды: до и после render)
	 * @param updateState - функция изменения данных (сигнал, массив и т.п.)
	 */
	animate(
		getElements: () => Iterable<HTMLElement>,
		updateState: () => void,
	): Promise<void>;
}