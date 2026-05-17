import { describe, it, expect, beforeEach } from 'vitest';
import { TrajectoryCalculator } from '../TrajectoryCalculator.ts';

function makeElement(rect: Partial<DOMRect> = {}): HTMLElement {
	const el = document.createElement('div');
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
		left: 0,
		top: 0,
		right: 0,
		bottom: 0,
		width: 0,
		height: 0,
		x: 0,
		y: 0,
		toJSON: () => ({}),
		...rect,
	});
	return el;
}

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
		const card = document.createElement('div');
		const mockRect = vi.spyOn(card, 'getBoundingClientRect');

		mockRect.mockReturnValueOnce({ left: 100, top: 50, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		calc.before([card]);

		mockRect.mockReturnValueOnce({ left: 200, top: 80, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		const trajectories = calc.calculate([card]);

		expect(trajectories).toHaveLength(1);
		expect(trajectories[0].deltaX).toBe(-100);
		expect(trajectories[0].deltaY).toBe(-30);
		expect(trajectories[0].element).toBe(card);
	});

	it('фильтрует неподвижные карточки', () => {
		const moving = document.createElement('div');
		const still = document.createElement('div');

		const movingRect = vi.spyOn(moving, 'getBoundingClientRect');
		const stillRect = vi.spyOn(still, 'getBoundingClientRect');

		movingRect.mockReturnValueOnce({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		stillRect.mockReturnValueOnce({ left: 50, top: 50, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		calc.before([moving, still]);

		movingRect.mockReturnValueOnce({ left: 100, top: 100, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		stillRect.mockReturnValueOnce({ left: 50, top: 50, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}) });
		const trajectories = calc.calculate([moving, still]);

		expect(trajectories).toHaveLength(1);
		expect(trajectories[0].element).toBe(moving);
	});

	it('before() сбрасывает предыдущий снимок', () => {
		const card = makeElement({ left: 10, top: 10 });
		calc.before([card]);

		const card2 = makeElement({ left: 0, top: 0 });
		calc.before([card2]);

		// card не в новом снимке — его траектория не считается
		vi.spyOn(card, 'getBoundingClientRect').mockReturnValue({
			left: 99, top: 99, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0, toJSON: () => ({}),
		});
		const trajectories = calc.calculate([card]);
		expect(trajectories).toHaveLength(0);
	});

	it('возвращает this из before() для chaining', () => {
		const calc2 = new TrajectoryCalculator();
		expect(calc2.before([])).toBe(calc2);
	});
});
