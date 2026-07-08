import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { useCardAnimation } from '../useCardAnimation.ts';
import { makeElement, moveTo } from '../../../__tests__/makeElement.ts';

describe('useCardAnimation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('возвращает snapshot, animateMove и isAnimating', () => {
		const { snapshot, animateMove, isAnimating } = useCardAnimation();
		expect(snapshot).toBeTypeOf('function');
		expect(animateMove).toBeTypeOf('function');
		expect(isAnimating.value).toBe(false);
	});

	it('isAnimating становится true во время анимации и false после', async () => {
		const { snapshot, animateMove, isAnimating } = useCardAnimation();

		const el = makeElement();
		snapshot([el]);
		moveTo(el, { left: 100, top: 50 });

		const promise = animateMove([el]);
		expect(isAnimating.value).toBe(true);
		await promise;
		expect(isAnimating.value).toBe(false);
	});

	it('isAnimating становится false даже при ошибке', async () => {
		const { snapshot, animateMove, isAnimating } = useCardAnimation();

		const el = makeElement();
		el.animate = vi.fn().mockReturnValue({
			finished: Promise.reject(new Error('animation failed')),
			reverse: vi.fn(),
		});

		snapshot([el]);
		moveTo(el, { left: 100 });

		await expect(animateMove([el])).rejects.toThrow('animation failed');
		expect(isAnimating.value).toBe(false);
	});

	it('принимает options: duration, easing, stagger', async () => {
		const { snapshot, animateMove } = useCardAnimation({
			duration: 500,
			easing: 'linear',
			stagger: 20,
		});

		const el = makeElement();
		snapshot([el]);
		moveTo(el, { left: 100 });

		await animateMove([el]);

		const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
		expect(opts.duration).toBe(500);
		expect(opts.easing).toBe('linear');
	});

	it('animateMove без снимка не запускает анимации', async () => {
		const { animateMove, isAnimating } = useCardAnimation();
		const el = makeElement();

		await animateMove([el]);

		expect(isAnimating.value).toBe(false);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).not.toHaveBeenCalled();
	});

	it('stagger увеличивает delay для каждого следующего элемента', async () => {
		const { snapshot, animateMove } = useCardAnimation({ stagger: 20 });

		const els = [makeElement(), makeElement(), makeElement()];
		snapshot(els);
		els.forEach(el => { moveTo(el, { left: 100 }); });

		await animateMove(els);

		els.forEach((el, i) => {
			const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
			expect(opts.delay).toBe(i * 20);
		});
	});
});
