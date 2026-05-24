import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardAnimation } from '../useCardAnimation.ts';

function makeElement(left = 0, top = 0): HTMLElement {
	const el = document.createElement('div');
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
		left, top, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
		toJSON: () => ({}),
	});
	el.animate = vi.fn().mockReturnValue({
		finished: Promise.resolve(),
		reverse: vi.fn(),
	});
	return el;
}

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

		const el = makeElement(0, 0);
		act(() => { result.current.snapshot([el]); });

		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 50, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

		await act(async () => {
			await result.current.animateMove([el]);
		});
		expect(result.current.isAnimating).toBe(false);
	});

	it('isAnimating становится false даже при ошибке в animate()', async () => {
		const { result } = renderHook(() => useCardAnimation());

		const el = document.createElement('div');
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});
		el.animate = vi.fn().mockReturnValue({
			finished: Promise.reject(new Error('animation failed')),
			reverse: vi.fn(),
		});

		act(() => { result.current.snapshot([el]); });
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

		await expect(
			act(async () => { await result.current.animateMove([el]); })
		).rejects.toThrow('animation failed');

		expect(result.current.isAnimating).toBe(false);
	});

	it('принимает options: duration, easing, stagger — передаются в element.animate()', async () => {
		const { result } = renderHook(() => useCardAnimation({ duration: 500, easing: 'linear', stagger: 20 }));

		const el = makeElement(0, 0);
		act(() => { result.current.snapshot([el]); });
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

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
});
