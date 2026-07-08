import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardAnimation } from '../useCardAnimation.ts';
import { makeElement, moveTo } from '../../../__tests__/makeElement.ts';

describe('useCardAnimation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('возвращает snapshot, animateMove как функции, isAnimating как false изначально', () => {
		const { result } = renderHook(() => useCardAnimation());
		expect(result.current.snapshot).toBeTypeOf('function');
		expect(result.current.animateMove).toBeTypeOf('function');
		expect(result.current.isAnimating).toBe(false);
	});

	it('isAnimating становится true во время анимации и false после', async () => {
		const { result } = renderHook(() => useCardAnimation());

		const el = makeElement();
		act(() => { result.current.snapshot([el]); });
		moveTo(el, { left: 100, top: 50 });

		let animatePromise!: Promise<void>;
		act(() => { animatePromise = result.current.animateMove([el]); });
		expect(result.current.isAnimating).toBe(true);

		await act(async () => {
			await animatePromise;
		});
		expect(result.current.isAnimating).toBe(false);
	});

	it('isAnimating становится false даже при ошибке в animate()', async () => {
		const { result } = renderHook(() => useCardAnimation());

		const el = makeElement();
		el.animate = vi.fn().mockReturnValue({
			finished: Promise.reject(new Error('animation failed')),
			reverse: vi.fn(),
		});

		act(() => { result.current.snapshot([el]); });
		moveTo(el, { left: 100 });

		await expect(
			act(async () => { await result.current.animateMove([el]); })
		).rejects.toThrow('animation failed');

		expect(result.current.isAnimating).toBe(false);
	});

	it('принимает options: duration, easing, stagger — передаются в element.animate()', async () => {
		const { result } = renderHook(() => useCardAnimation({ duration: 500, easing: 'linear', stagger: 20 }));

		const el = makeElement();
		act(() => { result.current.snapshot([el]); });
		moveTo(el, { left: 100 });

		await act(async () => { await result.current.animateMove([el]); });

		const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
		expect(opts.duration).toBe(500);
		expect(opts.easing).toBe('linear');
	});

	it('animateMove без предшествующего snapshot не вызывает element.animate()', async () => {
		const { result } = renderHook(() => useCardAnimation());
		const el = makeElement();

		await act(async () => { await result.current.animateMove([el]); });

		expect(result.current.isAnimating).toBe(false);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).not.toHaveBeenCalled();
	});

	it('stagger увеличивает delay для каждого следующего элемента', async () => {
		const { result } = renderHook(() => useCardAnimation({ stagger: 20 }));

		const els = [makeElement(), makeElement(), makeElement()];
		act(() => { result.current.snapshot(els); });
		els.forEach(el => { moveTo(el, { left: 100 }); });

		await act(async () => { await result.current.animateMove(els); });

		els.forEach((el, i) => {
			const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
			expect(opts.delay).toBe(i * 20);
		});
	});
});
