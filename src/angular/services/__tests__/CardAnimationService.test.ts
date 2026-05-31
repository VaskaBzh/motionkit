import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { CardAnimationService } from '../CardAnimationService.ts';
import type { NextRenderFn } from '../../types';
import { makeElement } from '../../../__tests__/makeElement.ts';

/**
 * Заменитель afterNextRender для тестов — resolves немедленно.
 * Передаётся в конструктор вместо default реализации.
 */
const immediateRender: NextRenderFn = () => Promise.resolve();

// ---------------------------------------------------------------------------
// Базовое поведение сервиса
// ---------------------------------------------------------------------------

describe('CardAnimationService', () => {
	let service: CardAnimationService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new CardAnimationService(immediateRender);
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

// ---------------------------------------------------------------------------
// animate() — высокоуровневый метод
// ---------------------------------------------------------------------------

describe('CardAnimationService.animate()', () => {
	let service: CardAnimationService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new CardAnimationService(immediateRender);
	});

	it('вызывает snapshot → updateState → animateMove в правильном порядке', async () => {
		const calls: string[] = [];

		const el = makeElement(0, 0);
		const getElements = vi.fn(() => {
			calls.push('getElements');
			return [el];
		});
		const updateState = vi.fn(() => {
			calls.push('updateState');
			vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
				left: 80, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
				toJSON: () => ({}),
			});
		});

		await service.animate(getElements, updateState);

		expect(getElements).toHaveBeenCalledTimes(2);
		expect(calls[0]).toBe('getElements');  // snapshot
		expect(calls[1]).toBe('updateState');
		expect(calls[2]).toBe('getElements');  // animateMove после render
	});

	it('предупреждает и пропускает вызов если isAnimating() === true', async () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

		const el = makeElement(0, 0);
		service.snapshot([el]);
		vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
			left: 50, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
			toJSON: () => ({}),
		});
		const ongoing = service.animateMove([el]);

		const updateState = vi.fn();
		await service.animate(() => [el], updateState);

		expect(warnSpy).toHaveBeenCalledWith(
			expect.stringContaining('[CardAnimationService]'),
		);
		expect(updateState).not.toHaveBeenCalled();

		await ongoing;
	});

	it('бросает ошибку если сервис создан вне DI (defaultNextRender + #injector=null)', async () => {
		// Без override — используется defaultNextRender, который бросает при null injector
		const serviceWithoutDI = new CardAnimationService();

		await expect(serviceWithoutDI.animate(() => [], () => undefined))
			.rejects.toThrow('[CardAnimationService]');
	});

	it('не вызывает el.animate если нет смещений после updateState', async () => {
		const el = makeElement(0, 0);

		await service.animate(() => [el], () => undefined);

		// eslint-disable-next-line @typescript-eslint/unbound-method
		expect(el.animate).not.toHaveBeenCalled();
	});

	it('nextRender вызывается с injector из DI-контекста', async () => {
		const nextRender = vi.fn(immediateRender);
		const serviceWithSpy = new CardAnimationService(nextRender);
		const el = makeElement(0, 0);

		await serviceWithSpy.animate(() => [el], () => undefined);

		// nextRender получил #injector (null в тестовой среде) — проверяем что он вызван
		expect(nextRender).toHaveBeenCalledOnce();
	});
});
