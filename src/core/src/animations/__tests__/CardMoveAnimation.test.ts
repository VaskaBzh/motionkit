import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { CardMoveAnimation } from '../CardMoveAnimation.ts';
import type { Trajectory } from '../../types';

interface AnimationLike {
	finished: Promise<void>;
	reverse: Mock;
	cancel: Mock;
}

function makeAnimationMock(): AnimationLike {
	return {
		finished: Promise.resolve(),
		reverse: vi.fn(),
		cancel: vi.fn(),
	};
}

function makeElement(): HTMLElement {
	const el = document.createElement('div');
	el.animate = vi.fn().mockReturnValue(makeAnimationMock());
	return el;
}

function makeTrajectory(el: HTMLElement, dx = 100, dy = 50): Trajectory {
	return { element: el, deltaX: dx, deltaY: dy };
}

describe('CardMoveAnimation', () => {
	let el: HTMLElement;

	beforeEach(() => {
		el = makeElement();
	});

	it('play() вызывает element.animate с правильными keyframes', async () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el, 100, 50));
		await anim.play();

		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).toHaveBeenCalledOnce();
		const [keyframes] = (el.animate as Mock).mock.calls[0] as [Keyframe[]];
		expect(keyframes[0]).toEqual({ transform: 'translate(100px, 50px)' });
		expect(keyframes[1]).toEqual({ transform: 'translate(0px, 0px)' });
	});

	it('play() передаёт опции анимации', async () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el), {
			duration: 500,
			easing: 'linear',
			delay: 100,
		});
		await anim.play();

		const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
		expect(opts.duration).toBe(500);
		expect(opts.easing).toBe('linear');
		expect(opts.delay).toBe(100);
		expect(opts.fill).toBe('backwards');
	});

	it('play() использует дефолтные опции если не переданы', async () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		await anim.play();

		const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
		expect(opts.duration).toBe(300);
		expect(opts.easing).toBe('ease');
		expect(opts.delay).toBe(0);
	});

	it('reverse() после play() вызывает nativeAnimation.reverse()', async () => {
		const nativeMock = makeAnimationMock();
		(el.animate as Mock).mockReturnValue(nativeMock);

		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		await anim.play();
		await anim.reverse();

		expect(nativeMock.reverse).toHaveBeenCalledOnce();
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).toHaveBeenCalledOnce(); // not called again
	});

	it('reverse() без предыдущего play() запускает обратную анимацию через animate()', async () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el, 100, 50));
		await anim.reverse();

		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).toHaveBeenCalledOnce();
		const [keyframes] = (el.animate as Mock).mock.calls[0] as [Keyframe[]];
		expect(keyframes[0]).toEqual({ transform: 'translate(0px, 0px)' });
		expect(keyframes[1]).toEqual({ transform: 'translate(100px, 50px)' });
	});

	it('cancel() до play() не бросает ошибку', () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		expect(() => {
			anim.cancel();
		}).not.toThrow();
	});

	it('cancel() после play() вызывает nativeAnimation.cancel()', async () => {
		const nativeMock = makeAnimationMock();
		(el.animate as Mock).mockReturnValue(nativeMock);

		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		await anim.play();
		anim.cancel();

		expect(nativeMock.cancel).toHaveBeenCalledOnce();
	});

	it('повторный play() после cancel() запускает новую анимацию', async () => {
		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		await anim.play();
		anim.cancel();
		await anim.play();

		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).toHaveBeenCalledTimes(2);
	});

	describe('prefers-reduced-motion', () => {
		it('коллапсирует duration до 1 при prefers-reduced-motion: reduce', async () => {
			vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

			const anim = new CardMoveAnimation(el, makeTrajectory(el));
			await anim.play();

			const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
			expect(opts.duration).toBe(1);

			vi.unstubAllGlobals();
		});

		it('не коллапсирует duration при prefers-reduced-motion: no-preference', async () => {
			vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));

			const anim = new CardMoveAnimation(el, makeTrajectory(el), { duration: 400 });
			await anim.play();

			const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
			expect(opts.duration).toBe(400);

			vi.unstubAllGlobals();
		});

		it('respectReducedMotion: false отключает учёт настройки', async () => {
			vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));

			const anim = new CardMoveAnimation(el, makeTrajectory(el), { duration: 300, respectReducedMotion: false });
			await anim.play();

			const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
			expect(opts.duration).toBe(300);

			vi.unstubAllGlobals();
		});
	});

	it('play() отменяет предыдущую анимацию перед запуском новой', async () => {
		const firstMock = makeAnimationMock();
		const secondMock = makeAnimationMock();
		(el.animate as Mock).mockReturnValueOnce(firstMock).mockReturnValueOnce(secondMock);

		const anim = new CardMoveAnimation(el, makeTrajectory(el));
		void anim.play();
		await anim.play();

		expect(firstMock.cancel).toHaveBeenCalledOnce();
	});
});
