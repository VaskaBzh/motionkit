import { ref } from 'vue';
import { AnimationBuilder } from '../../core/src';
import type { CardAnimationComposableOptions, UseCardAnimationReturn } from '../types';

/**
 * Vue composable для анимации движения карточек.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const cards = useTemplateRef<HTMLElement[]>('cards');
 * const { snapshot, animateMove } = useCardAnimation({ duration: 350, stagger: 30 });
 *
 * async function onReorder() {
 *   snapshot(cards.value);
 *   // reorder the reactive array...
 *   await nextTick();
 *   await animateMove(cards.value);
 * }
 * </script>
 * ```
 */
export function useCardAnimation(options: CardAnimationComposableOptions = {}): UseCardAnimationReturn {
	const builder = new AnimationBuilder();
	const isAnimating = ref(false);

	if (options.duration !== undefined) builder.withDuration(options.duration);
	if (options.easing !== undefined) builder.withEasing(options.easing);
	if (options.stagger !== undefined) builder.withStagger(options.stagger);

	const snapshot = (cards: Iterable<HTMLElement>): void => {
		builder.snapshot(cards);
	};

	const animateMove = async (cards: Iterable<HTMLElement>): Promise<void> => {
		isAnimating.value = true;
		try {
			const runner = builder.buildAnimation(cards);
			await runner.play();
		} finally {
			isAnimating.value = false;
		}
	};

	return { snapshot, animateMove, isAnimating };
}
