import { describe, it, expect, vi } from 'vitest';
import { AnimationRunner } from '../AnimationRunner.ts';
import { BaseAnimation } from '../../base/BaseAnimation.ts';

class FakeAnimation extends BaseAnimation {
	play = vi.fn().mockResolvedValue(undefined);
	reverse = vi.fn().mockResolvedValue(undefined);
}

describe('AnimationRunner', () => {
	it('add() возвращает this для chaining', () => {
		const runner = new AnimationRunner();
		const anim = new FakeAnimation();
		expect(runner.add(anim)).toBe(runner);
	});

	it('play() запускает все анимации параллельно', async () => {
		const runner = new AnimationRunner();
		const a = new FakeAnimation();
		const b = new FakeAnimation();
		runner.add(a).add(b);

		await runner.play();

		expect(a.play).toHaveBeenCalledOnce();
		expect(b.play).toHaveBeenCalledOnce();
	});

	it('play() на пустом runner резолвится без ошибок', async () => {
		await expect(new AnimationRunner().play()).resolves.toBeUndefined();
	});

	it('reverse() вызывает reverse() на всех анимациях', async () => {
		const runner = new AnimationRunner();
		const a = new FakeAnimation();
		const b = new FakeAnimation();
		runner.add(a).add(b);

		await runner.reverse();

		expect(a.reverse).toHaveBeenCalledOnce();
		expect(b.reverse).toHaveBeenCalledOnce();
	});

	it('reverse() на пустом runner резолвится без ошибок', async () => {
		await expect(new AnimationRunner().reverse()).resolves.toBeUndefined();
	});

	it('clear() удаляет все анимации', async () => {
		const runner = new AnimationRunner();
		const a = new FakeAnimation();
		runner.add(a);
		runner.clear();

		await runner.play();
		expect(a.play).not.toHaveBeenCalled();
	});

	it('clear() возвращает this для chaining', () => {
		const runner = new AnimationRunner();
		expect(runner.clear()).toBe(runner);
	});
});
