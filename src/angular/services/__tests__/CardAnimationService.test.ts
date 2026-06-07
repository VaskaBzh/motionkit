import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { CardAnimationService } from '../CardAnimationService.ts';
import { makeElement } from '../../../__tests__/makeElement.ts';

describe('CardAnimationService', () => {
	let service: CardAnimationService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new CardAnimationService();
	});

	it('isAnimating инициализируется как false', () => {
		expect(service.isAnimating()).toBe(false);
	});

	it('isAnimating становится true во время анимации и false после', async () => {
		const el = makeElement(0, 0);
		service.snapshot([el]);

		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 50, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

		const promise = service.animateMove([el]);
		expect(service.isAnimating()).toBe(true);
		await promise;
		expect(service.isAnimating()).toBe(false);
	});

	it('isAnimating становится false даже при ошибке', async () => {
		const el = makeElement(0, 0);
		el.animate = vi.fn().mockReturnValue({
			finished: Promise.reject(new Error('animation failed')),
			reverse: vi.fn(),
		});

		service.snapshot([el]);
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

		await expect(service.animateMove([el])).rejects.toThrow('animation failed');
		expect(service.isAnimating()).toBe(false);
	});

	it('принимает options через configure: duration, easing, stagger', async () => {
		service.configure({ duration: 500, easing: 'linear', stagger: 20 });

		const el = makeElement(0, 0);
		service.snapshot([el]);
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 100, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});

		await service.animateMove([el]);

		const [, opts] = (el.animate as Mock).mock.calls[0] as [Keyframe[], KeyframeAnimationOptions];
		expect(opts.duration).toBe(500);
		expect(opts.easing).toBe('linear');
	});

	it('animateMove без снимка не запускает анимации', async () => {
		const el = makeElement();

		await service.animateMove([el]);

		expect(service.isAnimating()).toBe(false);
		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).not.toHaveBeenCalled();
	});
});