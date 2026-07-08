import { useRef, useState, useCallback, useEffect } from 'react';
import { AnimationBuilder } from '../../core/src';
import type { CardAnimationHookOptions, UseCardAnimationReturn } from '../types';

/**
 * React hook для анимации движения карточек.
 *
 * @example
 * ```tsx
 * const cardRefs = useRef<HTMLElement[]>([]);
 * const { snapshot, animateMove } = useCardAnimation({ duration: 350, stagger: 30 });
 *
 * async function onReorder() {
 *   snapshot(cardRefs.current);
 *   // reorder state...
 *   await animateMove(cardRefs.current);
 * }
 * ```
 */
export function useCardAnimation(options: CardAnimationHookOptions = {}): UseCardAnimationReturn {
	const builderRef = useRef(new AnimationBuilder());
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		if (options.duration !== undefined) builderRef.current.withDuration(options.duration);
		if (options.easing !== undefined) builderRef.current.withEasing(options.easing);
		if (options.stagger !== undefined) builderRef.current.withStagger(options.stagger);
	}, [options.duration, options.easing, options.stagger]);

	const snapshot = useCallback((cards: Iterable<HTMLElement>): void => {
		builderRef.current.snapshot(cards);
	}, []);

	const animateMove = useCallback(async (cards: Iterable<HTMLElement>): Promise<void> => {
		setIsAnimating(true);
		try {
			await builderRef.current.buildAnimation(cards).play();
		} finally {
			setIsAnimating(false);
		}
	}, []);

	return { snapshot, animateMove, isAnimating };
}
