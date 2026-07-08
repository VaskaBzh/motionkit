import { describe, it, expect, beforeEach } from 'vitest';
import { TrajectoryCalculator } from '../TrajectoryCalculator.ts';
import { makeElement, moveTo } from '../../../../__tests__/makeElement.ts';

describe('TrajectoryCalculator', () => {
	let calc: TrajectoryCalculator;

	beforeEach(() => {
		calc = new TrajectoryCalculator();
	});

	it('возвращает пустой массив если before() не вызывался', () => {
		const card = makeElement({ left: 10, top: 20 });
		expect(calc.calculate([card])).toEqual([]);
	});

	it('возвращает пустой массив если карточка не сдвинулась', () => {
		const card = makeElement({ left: 10, top: 20 });
		calc.before([card]);
		expect(calc.calculate([card])).toEqual([]);
	});

	it('вычисляет deltaX и deltaY для сдвинувшейся карточки', () => {
		const card = makeElement({ left: 100, top: 50 });
		calc.before([card]);

		moveTo(card, { left: 200, top: 80 });
		const trajectories = calc.calculate([card]);

		expect(trajectories).toHaveLength(1);
		expect(trajectories[0].deltaX).toBe(-100);
		expect(trajectories[0].deltaY).toBe(-30);
		expect(trajectories[0].element).toBe(card);
	});

	it('фильтрует неподвижные карточки', () => {
		const moving = makeElement({ left: 0, top: 0 });
		const still = makeElement({ left: 50, top: 50 });
		calc.before([moving, still]);

		moveTo(moving, { left: 100, top: 100 });
		const trajectories = calc.calculate([moving, still]);

		expect(trajectories).toHaveLength(1);
		expect(trajectories[0].element).toBe(moving);
	});

	it('before() сбрасывает предыдущий снимок', () => {
		const card = makeElement({ left: 10, top: 10 });
		calc.before([card]);

		const card2 = makeElement({ left: 0, top: 0 });
		calc.before([card2]);

		moveTo(card, { left: 99, top: 99 });
		const trajectories = calc.calculate([card]);
		expect(trajectories).toHaveLength(0);
	});

	it('возвращает this из before() для chaining', () => {
		const calc2 = new TrajectoryCalculator();
		expect(calc2.before([])).toBe(calc2);
	});
});
