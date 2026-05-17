import { BaseAnimation } from '../base/BaseAnimation.js';
import type { CardMoveOptions, Trajectory } from '../types';

/**
 * Анимирует одну карточку по заранее вычисленной траектории (FLIP).
 * Использует Web Animations API для плавного движения без layout thrashing.
 */
export class CardMoveAnimation extends BaseAnimation {
	readonly #element: HTMLElement;
	readonly #deltaX: number;
	readonly #deltaY: number;
	readonly #options: Required<CardMoveOptions>;
	#nativeAnimation: Animation | null = null;

	/**
	 * @param element - DOM-элемент карточки
	 * @param trajectory - Вычисленное смещение (результат TrajectoryCalculator)
	 * @param options - Опции анимации
	 */
	constructor(element: HTMLElement, { deltaX, deltaY }: Trajectory, options: CardMoveOptions = {}) {
		super();
		this.#element = element;
		this.#deltaX = deltaX;
		this.#deltaY = deltaY;
		this.#options = { duration: 300, easing: 'ease', delay: 0, ...options };
	}

	public override play(): Promise<void> {
		this.#nativeAnimation = this.#element.animate(
			[
				{ transform: `translate(${this.#deltaX}px, ${this.#deltaY}px)` },
				{ transform: 'translate(0px, 0px)' },
			],
			{
				duration: this.#options.duration,
				easing: this.#options.easing,
				delay: this.#options.delay,
				fill: 'backwards',
			}
		);

		return this.#nativeAnimation.finished.then(() => undefined);
	}

	public override reverse(): Promise<void> {
		if (this.#nativeAnimation) {
			this.#nativeAnimation.reverse();
			return this.#nativeAnimation.finished.then(() => undefined);
		}

		this.#nativeAnimation = this.#element.animate(
			[
				{ transform: 'translate(0px, 0px)' },
				{ transform: `translate(${this.#deltaX}px, ${this.#deltaY}px)` },
			],
			{
				duration: this.#options.duration,
				easing: this.#options.easing,
				fill: 'none',
			}
		);

		return this.#nativeAnimation.finished.then(() => undefined);
	}
}
