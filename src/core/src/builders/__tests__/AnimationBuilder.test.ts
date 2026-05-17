import { describe, it, expect, vi } from 'vitest';
import { AnimationBuilder } from '../AnimationBuilder.js';
import { TrajectoryCalculator } from '../../calculators/TrajectoryCalculator.js';
import type { AnimationConstructor, Trajectory } from '../../types/index.js';

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
		const runner = builder.buildAnimation([]);
		expect(runner).toBeDefined();
	});

	it('withDuration, withEasing, withStagger возвращают this', () => {
		const builder = new AnimationBuilder();
		expect(builder.withDuration(500)).toBe(builder);
		expect(builder.withEasing('linear')).toBe(builder);
		expect(builder.withStagger(20)).toBe(builder);
	});

	it('use() возвращает this для chaining', () => {
		const builder = new AnimationBuilder();
		const CustomAnim = vi.fn() as unknown as AnimationConstructor;
		expect(builder.use(CustomAnim)).toBe(builder);
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

	it('buildAnimation создаёт runner с анимациями для каждой траектории', () => {
		const calc = new TrajectoryCalculator();
		const el1 = document.createElement('div');
		const el2 = document.createElement('div');

		vi.spyOn(calc, 'calculate').mockReturnValue([
			makeTrajectory(el1, 100, 0),
			makeTrajectory(el2, 0, 50),
		]);

		const runner = new AnimationBuilder(calc).buildAnimation([el1, el2]);
		el1.animate = vi.fn().mockReturnValue({ finished: Promise.resolve(), reverse: vi.fn() });
		el2.animate = vi.fn().mockReturnValue({ finished: Promise.resolve(), reverse: vi.fn() });

		expect(runner).toBeDefined();
	});

	it('buildAnimation возвращает пустой runner если нет траекторий', async () => {
		const calc = new TrajectoryCalculator();
		vi.spyOn(calc, 'calculate').mockReturnValue([]);

		const runner = new AnimationBuilder(calc).buildAnimation([]);
		await expect(runner.play()).resolves.toBeUndefined();
	});

	it('use() подключает пользовательский класс анимации', async () => {
		const calc = new TrajectoryCalculator();
		const el = document.createElement('div');

		vi.spyOn(calc, 'calculate').mockReturnValue([
			{ element: el, deltaX: 50, deltaY: 0 },
		]);

		const playFn = vi.fn().mockResolvedValue(undefined);
		let capturedElement: HTMLElement | null = null;
		let capturedTrajectory: Trajectory | null = null;

		// regular function (не стрелка) — обязательно для вызова через new
		function CustomAnimation(
			this: { play: typeof playFn; reverse: ReturnType<typeof vi.fn> },
			element: HTMLElement,
			trajectory: Trajectory,
		): void {
			capturedElement = element;
			capturedTrajectory = trajectory;
			this.play = playFn;
			this.reverse = vi.fn().mockResolvedValue(undefined);
		}

		const runner = new AnimationBuilder(calc)
			.use(CustomAnimation as unknown as AnimationConstructor)
			.buildAnimation([el]);

		await runner.play();

		expect(capturedElement).toBe(el);
		expect(capturedTrajectory).toMatchObject({ deltaX: 50 });
		expect(playFn).toHaveBeenCalledOnce();
	});
});
