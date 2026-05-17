import type { Trajectory } from '../types/index.js';

type Position = { x: number; y: number };

/**
 * Вычисляет траектории движения карточек по технике FLIP
 * (First → Last → Invert → Play).
 *
 * Использование:
 * 1. `before()` — снимок позиций до изменения DOM
 * 2. (изменение DOM)
 * 3. `calculate()` — вычисление дельт по новым позициям
 */
export class TrajectoryCalculator {
	readonly #beforeSnapshot = new Map<HTMLElement, Position>();

	/**
	 * Запоминает текущие позиции карточек (шаг First).
	 * Вызывать до любого изменения DOM.
	 */
	public before(cards: Iterable<HTMLElement>): this {
		this.#beforeSnapshot.clear();

		for (const card of cards) {
			const { left, top } = card.getBoundingClientRect();
			this.#beforeSnapshot.set(card, { x: left, y: top });
		}

		return this;
	}

	/**
	 * Вычисляет смещения карточек (шаг Invert).
	 * Вызывать после изменения DOM.
	 * @returns Массив траекторий только для карточек, которые сдвинулись
	 */
	public calculate(cards: Iterable<HTMLElement>): Trajectory[] {
		const trajectories: Trajectory[] = [];

		for (const card of cards) {
			const before = this.#beforeSnapshot.get(card);
			if (!before) continue;

			const { left, top } = card.getBoundingClientRect();
			const deltaX = before.x - left;
			const deltaY = before.y - top;

			if (deltaX !== 0 || deltaY !== 0) {
				trajectories.push({ element: card, deltaX, deltaY });
			}
		}

		return trajectories;
	}
}
