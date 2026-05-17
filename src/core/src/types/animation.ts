import type { Trajectory } from './trajectory.js';
import type { BaseAnimation } from '../base/BaseAnimation.js';

/** Опции анимации для отдельной карточки. */
export interface CardMoveOptions {
	/** Длительность анимации в мс. По умолчанию 300. */
	duration?: number;
	/** CSS-функция плавности. По умолчанию 'ease'. */
	easing?: string;
	/** Задержка старта в мс. По умолчанию 0. */
	delay?: number;
}

/** Контракт конструктора подключаемого модуля анимации. */
export interface AnimationConstructor {
	new(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions): BaseAnimation;
}
