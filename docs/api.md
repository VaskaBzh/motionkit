[← Getting Started](getting-started.md) · [Back to README](../README.md) · [Architecture →](architecture.md)

# API Reference

## AnimationBuilder

The main entry point. A fluent builder for configuring and playing FLIP animations.

```typescript
import { AnimationBuilder } from '@motionlab/motionkit/core';
```

### Constructor

```typescript
new AnimationBuilder(calculator?: TrajectoryCalculator)
```

| Parameter    | Type                  | Default                     | Description                  |
|--------------|-----------------------|-----------------------------|------------------------------|
| `calculator` | `TrajectoryCalculator` | `new TrajectoryCalculator()` | Custom trajectory calculator |

### Configuration Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `use(module: AnimationConstructor)` | `this` | Plug in a custom animation class (default: `CardMoveAnimation`) |
| `withDuration(ms: number)` | `this` | Animation duration in ms (default: 300) |
| `withEasing(easing: string)` | `this` | CSS easing function (default: `'ease'`) |
| `withStagger(ms: number)` | `this` | Delay between adjacent cards in ms (default: 0) |

### Pipeline Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `snapshot(cards: Iterable<HTMLElement>)` | `this` | Records card positions **before** DOM change |
| `buildAnimation(cards: Iterable<HTMLElement>)` | `AnimationRunner` | Builds a runner with FLIP animations **after** DOM change |

### Example

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

`use()` replaces the built-in `CardMoveAnimation` with any class that implements `BaseAnimation`:

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

Orchestrator: plays a set of animations in parallel.

```typescript
import { AnimationRunner } from '@motionlab/motionkit/core';
```

> You typically don't create `AnimationRunner` directly — it is returned by `builder.buildAnimation()`.

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `add(animation: BaseAnimation)` | `this` | Adds an animation to the queue |
| `play()` | `Promise<void>` | Plays all animations in parallel |
| `reverse()` | `Promise<void>` | Plays all animations in reverse |
| `clear()` | `this` | Clears the animation list |

---

## BaseAnimation

Abstract base class. Extend it to create your own animations.

```typescript
import { BaseAnimation } from '@motionlab/motionkit/core';
```

### Abstract Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `play()` | `Promise<void>` | Play the animation |
| `reverse()` | `Promise<void>` | Play in reverse |

---

## TrajectoryCalculator

Calculates card offsets using the FLIP technique.

```typescript
import { TrajectoryCalculator } from '@motionlab/motionkit/core';
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `before(cards: Iterable<HTMLElement>)` | `this` | Records positions (**First** step) |
| `calculate(cards: Iterable<HTMLElement>)` | `Trajectory[]` | Computes deltas (**Invert** step) |

> Returns only cards where `deltaX !== 0 || deltaY !== 0`.

---

## CardMoveAnimation

FLIP animation executor for a single card via the Web Animations API.

```typescript
import { CardMoveAnimation } from '@motionlab/motionkit/core';
```

### Constructor

```typescript
new CardMoveAnimation(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions)
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `play()` | `Promise<void>` | Animates the card from its old position to the new one |
| `reverse()` | `Promise<void>` | Animates in the reverse direction |

---

## Vue 3 — useCardAnimation

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';
```

### Signature

```typescript
function useCardAnimation(options?: CardAnimationComposableOptions): UseCardAnimationReturn
```

### Options

| Parameter  | Type     | Default  | Description                        |
|------------|----------|----------|------------------------------------|
| `duration` | `number` | `300`    | Animation duration in ms           |
| `easing`   | `string` | `'ease'` | CSS easing function                |
| `delay`    | `number` | `0`      | Start delay in ms                  |
| `stagger`  | `number` | `0`      | Delay between cards in ms          |

### Return Values

| Field         | Type                                              | Description                                  |
|---------------|---------------------------------------------------|----------------------------------------------|
| `snapshot`    | `(cards: Iterable<HTMLElement>) => void`          | Records positions before DOM change          |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>` | Plays animation after DOM change             |
| `isAnimating` | `Ref<boolean>`                                    | Reactive flag — `true` while animating       |

---

## Types

```typescript
/** Computed offset for a single card (result of the FLIP calculation). */
interface Trajectory {
  element: HTMLElement;
  deltaX: number;  // horizontal offset in pixels
  deltaY: number;  // vertical offset in pixels
}

/** Per-card animation options. */
interface CardMoveOptions {
  duration?: number;  // ms, default 300
  easing?: string;    // CSS function, default 'ease'
  delay?: number;     // ms, default 0
}

/** Final builder configuration. */
interface BuilderConfig {
  duration: number;
  easing: string;
  stagger: number;  // delay between adjacent cards
}

/** Constructor signature for a custom animation class passed to use(). */
interface AnimationConstructor {
  new(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions): BaseAnimation;
}
```

## See Also

- [Getting Started](getting-started.md) — installation and basic examples
- [Architecture](architecture.md) — how to add a new animation type
