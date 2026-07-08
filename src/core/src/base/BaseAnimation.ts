/**
 * Абстрактный базовый класс для всех анимаций библиотеки.
 * Определяет контракт воспроизведения, реверса и отмены.
 */
export abstract class BaseAnimation {
	/** Запускает анимацию вперёд. Возвращает Promise, который резолвится по завершении. */
	public abstract play(): Promise<void>;

	/** Воспроизводит анимацию в обратном порядке. */
	public abstract reverse(): Promise<void>;

	/** Немедленно останавливает анимацию, если она активна. */
	public abstract cancel(): void;
}
