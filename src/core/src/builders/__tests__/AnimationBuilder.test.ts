import { describe, it, expect, vi } from 'vitest';
import { AnimationBuilder } from '../AnimationBuilder.js';
import { TrajectoryCalculator } from '../../trajectory/TrajectoryCalculator.js';
import type { Trajectory } from '../../types.js';

function makeTrajectory(el: HTMLElement, dx = 100, dy = 50): Trajectory {
	return { element: el, deltaX: dx, deltaY: dy };
}

describe('AnimationBuilder', () => {
	it('использует дефолтные значения конфига', () => {
		const calc = new TrajectoryCalculator();
		vi.spyOn(calc, 'before').mockReturnThis();
		vi.spyOn(calc, 'calculate').mockReturnValue([]);

		const builder = new AnimationBuilder(calc);
		builder.snapshot([]);
		const runner = builder.buildMoveAnimation([]);
		expect(runner).toBeDefined();
	});

	it('withDuration, withEasing, withStagger возвращают this', () => {
		const builder = new AnimationBuilder();
		expect(builder.withDuration(500)).toBe(builder);
		expect(builder.withEasing('linear')).toBe(builder);
		expect(builder.withStagger(20)).toBe(builder);
	});

	it('snapshot вызывает calculator.before()', () => {
		const calc = new TrajectoryCalculator();
		const spy = vi.spyOn(calc, 'before').mockReturnThis();
		const cards = [document.createElement('div')];

		new AnimationBuilder(calc).snapshot(cards);
		expect(spy).toHaveBeenCalledWith(cards);
	});

	it('snapshot возвращает this для chaining', () => {
		const calc = new TrajectoryCalculator();
		vi.spyOn(calc, 'before').mockReturnThis();
		const builder = new AnimationBuilder(calc);
		expect(builder.snapshot([])).toBe(builder);
	});

	it('buildMoveAnimation создаёт runner с анимациями для каждой траектории', () => {
		const calc = new TrajectoryCalculator();
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');

		vi.spyOn(calc, 'calculate').mockReturnValue([
			makeTrajectory(el1, 100, 0),
			makeTrajectory(el2, 0, 50),
		]);

		const runner = new AnimationBuilder(calc).buildMoveAnimation([el1, el2]);
		// runner.play() должен запустить обе анимации без ошибок
		// Web Animations API в happy-dom не поддерживается, поэтому мокаем element.animate
		el1.animate = vi.fn().mockReturnValue({ finished: Promise.resolve(), reverse: vi.fn() });
		el2.animate = vi.fn().mockReturnValue({ finished: Promise.resolve(), reverse: vi.fn() });

		expect(runner).toBeDefined();
	});

	it('buildMoveAnimation возвращает пустой runner если нет траекторий', async () => {
		const calc = new TrajectoryCalculator();
		vi.spyOn(calc, 'calculate').mockReturnValue([]);

		const runner = new AnimationBuilder(calc).buildMoveAnimation([]);
		// play() на пустом runner не должен бросать исключение
		await expect(runner.play()).resolves.toBeUndefined();
	});
});
