import type { Trajectory } from '../types';

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

		// Читаем все rect-ы за один проход, не перемежая с другой логикой —
		// один layout reflow вместо N.
		const cardArray = [...cards];
		const rects = cardArray.map((el) => el.getBoundingClientRect());

		for (let i = 0; i < cardArray.length; i++) {
			const rect = rects[i];
			this.#beforeSnapshot.set(cardArray[i], { x: rect.left, y: rect.top });
		}

		return this;
	}

	/**
	 * Вычисляет смещения карточек (шаг Invert).
	 * Вызывать после изменения DOM.
	 * @returns Массив траекторий только для карточек, которые сдвинулись
	 */
	public calculate(cards: Iterable<HTMLElement>): Trajectory[] {
		// Читаем все rect-ы за один проход, не перемежая с другой логикой —
		// один layout reflow вместо N.
		const cardArray = [...cards];
		const rects = cardArray.map((el) => el.getBoundingClientRect());
		const trajectories: Trajectory[] = [];

		for (let i = 0; i < cardArray.length; i++) {
			const card = cardArray[i];
			const before = this.#beforeSnapshot.get(card);
			if (!before) continue;

			const rect = rects[i];
			const deltaX = before.x - rect.left;
			const deltaY = before.y - rect.top;

			if (deltaX !== 0 || deltaY !== 0) {
				trajectories.push({ element: card, deltaX, deltaY });
			}
		}

		return trajectories;
	}
}
