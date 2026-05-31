[← Начало работы](getting-started.md) · [Back to README](../README.md) · [Архитектура →](architecture.md)

# API Reference

## AnimationBuilder

Главная точка входа. Fluent builder для настройки и запуска FLIP-анимаций.

```typescript
import { AnimationBuilder } from '@motionlab/motionkit/core';
```

### Конструктор

```typescript
new AnimationBuilder(calculator?: TrajectoryCalculator)
```

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|---------|
| `calculator` | `TrajectoryCalculator` | `new TrajectoryCalculator()` | Кастомный калькулятор траекторий |

### Методы настройки

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `use(module: AnimationConstructor)` | `this` | Подключает пользовательский класс анимации (по умолчанию `CardMoveAnimation`) |
| `withDuration(ms: number)` | `this` | Длительность анимации в мс (по умолчанию 300) |
| `withEasing(easing: string)` | `this` | CSS-функция плавности (по умолчанию `'ease'`) |
| `withStagger(ms: number)` | `this` | Задержка между соседними карточками в мс (по умолчанию 0) |

### Методы pipeline

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `snapshot(cards: Iterable<HTMLElement>)` | `this` | Запоминает позиции карточек **до** изменения DOM |
| `buildAnimation(cards: Iterable<HTMLElement>)` | `AnimationRunner` | Строит runner с FLIP-анимациями **после** изменения DOM |

### Пример

```typescript
const builder = new AnimationBuilder()
  .withDuration(400)
  .withEasing('cubic-bezier(0.25, 0.46, 0.45, 0.94)')
  .withStagger(25);

builder.snapshot(cards);
reorder();
await builder.buildAnimation(cards).play();
```

### Plugin API — use()

`use()` позволяет заменить встроенный `CardMoveAnimation` на любой класс, реализующий `BaseAnimation`:

```typescript
import { AnimationBuilder, BaseAnimation } from '@motionlab/motionkit/core';
import type { AnimationConstructor, Trajectory, CardMoveOptions } from '@motionlab/motionkit/core';

class CardFadeAnimation extends BaseAnimation {
  readonly #element: HTMLElement;
  readonly #duration: number;

  constructor(element: HTMLElement, _trajectory: Trajectory, options: CardMoveOptions = {}) {
    super();
    this.#element = element;
    this.#duration = options.duration ?? 300;
  }

  override play(): Promise<void> {
    return this.#element
      .animate([{ opacity: 0 }, { opacity: 1 }], { duration: this.#duration, fill: 'backwards' })
      .finished.then(() => undefined);
  }

  override reverse(): Promise<void> {
    return this.#element
      .animate([{ opacity: 1 }, { opacity: 0 }], { duration: this.#duration })
      .finished.then(() => undefined);
  }
}

const runner = new AnimationBuilder()
  .use(CardFadeAnimation)
  .withDuration(250)
  .buildAnimation(cards);

await runner.play();
```

---

## AnimationRunner

Оркестратор: запускает набор анимаций параллельно.

```typescript
import { AnimationRunner } from '@motionlab/motionkit/core';
```

> Обычно ты не создаёшь `AnimationRunner` напрямую — он возвращается из `builder.buildAnimation()`.

### Методы

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `add(animation: BaseAnimation)` | `this` | Добавляет анимацию в очередь |
| `play()` | `Promise<void>` | Запускает все анимации параллельно |
| `reverse()` | `Promise<void>` | Воспроизводит все анимации в обратном порядке |
| `clear()` | `this` | Очищает список анимаций |

---

## BaseAnimation

Абстрактный базовый класс. Наследуй его для создания собственных анимаций.

```typescript
import { BaseAnimation } from '@motionlab/motionkit/core';
```

### Абстрактные методы

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `play()` | `Promise<void>` | Воспроизведение анимации |
| `reverse()` | `Promise<void>` | Обратное воспроизведение |

---

## TrajectoryCalculator

Вычисляет смещения карточек по технике FLIP.

```typescript
import { TrajectoryCalculator } from '@motionlab/motionkit/core';
```

### Методы

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `before(cards: Iterable<HTMLElement>)` | `this` | Запоминает позиции (**шаг First**) |
| `calculate(cards: Iterable<HTMLElement>)` | `Trajectory[]` | Вычисляет дельты (**шаг Invert**) |

> Возвращает только те карточки, у которых `deltaX !== 0 || deltaY !== 0`.

---

## CardMoveAnimation

Исполнитель FLIP-анимации для одной карточки через Web Animations API.

```typescript
import { CardMoveAnimation } from '@motionlab/motionkit/core';
```

### Конструктор

```typescript
new CardMoveAnimation(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions)
```

### Методы

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `play()` | `Promise<void>` | Анимирует карточку из старой позиции в новую |
| `reverse()` | `Promise<void>` | Анимирует в обратном направлении |

---

## Vue 3 — useCardAnimation

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';
```

### Сигнатура

```typescript
function useCardAnimation(options?: CardAnimationComposableOptions): UseCardAnimationReturn
```

### Опции

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|-------------|---------|
| `duration` | `number` | `300` | Длительность анимации в мс |
| `easing` | `string` | `'ease'` | CSS-функция плавности |
| `delay` | `number` | `0` | Задержка старта в мс |
| `stagger` | `number` | `0` | Задержка между карточками в мс |

### Возвращаемые значения

| Поле | Тип | Описание |
|------|-----|---------|
| `snapshot` | `(cards: Iterable<HTMLElement>) => void` | Делает снимок позиций до изменения DOM |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>` | Запускает анимацию после изменения DOM |
| `isAnimating` | `Ref<boolean>` | Реактивный флаг активной анимации |

---

## Типы

```typescript
/** Вычисленное смещение одной карточки (результат FLIP-расчёта). */
interface Trajectory {
  element: HTMLElement;
  deltaX: number;  // горизонтальное смещение в пикселях
  deltaY: number;  // вертикальное смещение в пикселях
}

/** Опции анимации для отдельной карточки. */
interface CardMoveOptions {
  duration?: number;  // мс, по умолчанию 300
  easing?: string;    // CSS-функция, по умолчанию 'ease'
  delay?: number;     // мс, по умолчанию 0
}

/** Итоговая конфигурация builder-а. */
interface BuilderConfig {
  duration: number;
  easing: string;
  stagger: number;  // задержка между соседними карточками
}

/** Конструктор пользовательского класса анимации для use(). */
interface AnimationConstructor {
  new(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions): BaseAnimation;
}
```

---

## Angular — CardAnimationService

```typescript
import { CardAnimationService } from '@motionlab/motionkit/angular';
```

Подключается через `providers: [CardAnimationService]` в декораторе компонента — каждый компонент получает независимый экземпляр.

### Свойства

| Свойство | Тип | Описание |
|----------|-----|---------|
| `isAnimating` | `Signal<boolean>` | `true` пока идёт анимация. Читать как `isAnimating()` |

### Методы

| Метод | Возвращает | Описание |
|-------|-----------|---------|
| `configure(options)` | `void` | Применяет опции анимации (duration, easing, stagger) |
| `snapshot(cards)` | `void` | Снимок позиций **до** изменения DOM (шаг First) |
| `animateMove(cards)` | `Promise<void>` | Анимирует после изменения DOM (шаги Last→Invert→Play) |
| `animate(getElements, updateState)` | `Promise<void>` | **Высокоуровневый:** делает всё сам — снимок, ожидание render, анимация |

### `configure(options)`

```typescript
configure(options: {
  duration?: number;  // мс, по умолчанию 300
  easing?: string;    // CSS-функция, по умолчанию 'ease'
  stagger?: number;   // задержка между карточками в мс, по умолчанию 0
}): void
```

### `animate(getElements, updateState)` ✨

```typescript
animate(
  getElements: () => Iterable<HTMLElement>,
  updateState: () => void,
): Promise<void>
```

Высокоуровневый метод. Управляет полным FLIP-циклом: снимает позиции, вызывает `updateState`, ждёт Angular render (фаза `read`), затем анимирует.

`getElements` вызывается **дважды**: до `updateState` (снимок «до») и после render (элементы «после»).

> Требует Angular DI-контекста. Если сервис создан вне `providers:` — бросает `Error`.
> Если вызван во время активной анимации — выводит `console.warn` и завершается без эффекта.

**Пример:**

```typescript
await this.anim.animate(
  () => this.cardEls().map(r => r.nativeElement),
  () => this.cards.update(arr => shuffleArr(arr)),
);
```

### `snapshot(cards)` + `animateMove(cards)` — ручной контроль

Низкоуровневый API для нестандартных сценариев или ванильного JS:

```typescript
this.anim.snapshot(elements);
updateYourData();
// ... вручную ждёте render-цикл (например через afterNextRender) ...
await this.anim.animateMove(newElements);
```

> Подробнее о ручном подходе — [docs/angular.md](angular.md).

---

## See Also

- [Начало работы](getting-started.md) — установка и базовые примеры
- [Angular интеграция](angular.md) — полное руководство по `CardAnimationService`
- [Архитектура](architecture.md) — как добавить новый тип анимации
