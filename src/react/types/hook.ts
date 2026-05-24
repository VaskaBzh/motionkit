import type { CardMoveOptions } from '../../core/src';

export interface CardAnimationHookOptions extends CardMoveOptions {
	stagger?: number;
}

/** isAnimating — обычный boolean (не Ref), React управляет ре-рендером через useState. */
export interface UseCardAnimationReturn {
	snapshot: (cards: Iterable<HTMLElement>) => void;
	animateMove: (cards: Iterable<HTMLElement>) => Promise<void>;
	isAnimating: boolean;
}
