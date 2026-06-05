import type { Signal } from '@angular/core';
import type { CardMoveOptions } from '../../core/src';

/** Опции настройки CardAnimationService. */
export interface CardAnimationServiceOptions extends CardMoveOptions {
	stagger?: number;
}

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
}