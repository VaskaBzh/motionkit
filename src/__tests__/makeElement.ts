import { vi, type Mock } from 'vitest';
import type { Trajectory } from '../core/src/types';

const DEFAULT_RECT = {
	left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
	toJSON: (): Record<string, never> => ({}),
};

export function makeElement(rect: Partial<DOMRect> = {}): HTMLElement {
	const el = document.createElement('div');
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ ...DEFAULT_RECT, ...rect });
	el.animate = vi.fn().mockReturnValue(makeAnimationMock());
	return el;
}

export function moveTo(el: HTMLElement, rect: Partial<DOMRect>): void {
	vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({ ...DEFAULT_RECT, ...rect });
}

export function makeAnimationMock(): { finished: Promise<void>; reverse: Mock; cancel: Mock } {
	return {
		finished: Promise.resolve(),
		reverse: vi.fn(),
		cancel: vi.fn(),
	};
}

export function makeTrajectory(el: HTMLElement, dx = 100, dy = 50): Trajectory {
	return { element: el, deltaX: dx, deltaY: dy };
}
