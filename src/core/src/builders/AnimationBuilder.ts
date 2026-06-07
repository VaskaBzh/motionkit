import { TrajectoryCalculator } from '../calculators/TrajectoryCalculator.ts';
import { CardMoveAnimation } from '../animations/CardMoveAnimation.ts';
import { AnimationRunner } from '../animations/AnimationRunner.ts';
import type { BuilderConfig, AnimationConstructor } from '../types';

/**
 * Fluent builder для создания анимаций карточек.
 *
 * @example
 * ```ts
 * import { CardMoveAnimation } from './animations/CardMoveAnimation.ts';
 *
 * const builder = new AnimationBuilder()
 *   .use(CardMoveAnimation)
 *   .withDuration(350)
 *   .withEasing('cubic-bezier(0.4, 0, 0.2, 1)')
 *   .withStagger(30);
 *
 * builder.snapshot(cards);          // before DOM change
 * // ... change the DOM ...
 * await builder.buildAnimation(cards).play(); // after
 * ```
 */
export class AnimationBuilder {
	#config: BuilderConfig = {
		duration: 300,
		easing: 'ease',
		stagger: 0,
	};
	readonly #calculator: TrajectoryCalculator;
	#animationModule: AnimationConstructor = CardMoveAnimation;

	/**
	 * @param calculator - Реализация TrajectoryCalculator (по умолчанию создаётся автоматически)
	 */
	public constructor(calculator: TrajectoryCalculator = new TrajectoryCalculator()) {
		this.#calculator = calculator;
	}

	/** Устанавливает класс анимации, который будет использован при вызове `buildAnimation()`. */
	public use(module: AnimationConstructor): this {
		this.#animationModule = module;
		return this;
	}

	/** Устанавливает длительность анимации в миллисекундах. */
	public withDuration(ms: number): this {
		this.#config.duration = ms;
		return this;
	}

	/** Устанавливает CSS-функцию плавности. */
	public withEasing(easing: string): this {
		this.#config.easing = easing;
		return this;
	}

	/** Устанавливает задержку между анимациями соседних карточек. */
	public withStagger(ms: number): this {
		this.#config.stagger = ms;
		return this;
	}

	/** Делает снимок позиций карточек до изменения DOM (шаг First). */
	public snapshot(cards: Iterable<HTMLElement>): this {
		this.#calculator.before(cards);
		return this;
	}

	/**
	 * Строит {@link AnimationRunner} с анимациями для всех сдвинувшихся карточек.
	 * Вызывать после изменения DOM.
	 * @param cards - Те же карточки, что и в `snapshot()`
	 */
	public buildAnimation(cards: Iterable<HTMLElement>): AnimationRunner {
		const trajectories = this.#calculator.calculate(cards);
		const runner = new AnimationRunner();
		const AnimClass = this.#animationModule;

		trajectories.forEach((trajectory, index) => {
			runner.add(
				new AnimClass(trajectory.element, trajectory, {
					...this.#config,
					delay: index * this.#config.stagger,
				})
			);
		});

		return runner;
	}
}
