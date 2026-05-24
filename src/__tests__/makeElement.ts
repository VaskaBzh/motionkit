import { vi } from 'vitest';

export function makeElement(left = 0, top = 0): HTMLElement {
	const el = document.createElement('div');
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
		left, top, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
		toJSON: () => ({}),
	});
	el.animate = vi.fn().mockReturnValue({
		finished: Promise.resolve(),
		reverse: vi.fn(),
	});
	return el;
}