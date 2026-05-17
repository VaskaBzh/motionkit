/**
 * Абстрактный базовый класс для всех анимаций библиотеки.
 * Определяет контракт воспроизведения и реверса.
 */
export abstract class BaseAnimation {
	/** Запускает анимацию вперёд. Возвращает Promise, который резолвится по завершении. */
	public abstract play(): Promise<void>;

	/** Воспроизводит анимацию в обратном порядке. */
	public abstract reverse(): Promise<void>;
}
