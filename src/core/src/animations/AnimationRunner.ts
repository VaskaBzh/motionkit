import type { BaseAnimation } from '../base/BaseAnimation.ts';

/**
 * Оркестратор: запускает набор анимаций параллельно и ждёт их завершения.
 */
export class AnimationRunner {
	readonly #animations: BaseAnimation[] = [];

	/**
	 * Добавляет анимацию в очередь запуска.
	 * @returns this (для цепочки вызовов)
	 */
	public add(animation: BaseAnimation): this {
		this.#animations.push(animation);
		return this;
	}

	/** Запускает все анимации параллельно. */
	public play(): Promise<void> {
		return Promise.all(this.#animations.map((anim) => anim.play())).then(() => undefined);
	}

	/** Воспроизводит все анимации в обратном порядке параллельно. */
	public reverse(): Promise<void> {
		return Promise.all(this.#animations.map((anim) => anim.reverse())).then(() => undefined);
	}

	/** Очищает список анимаций. */
	public clear(): this {
		this.#animations.length = 0;
		return this;
	}
}
