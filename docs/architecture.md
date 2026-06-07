[← API Reference](api.md) · [Back to README](../README.md) · [Contributing →](contributing.md)

# Architecture

## Overview

`@motionlab/motionkit` uses a **modular library architecture**: a framework-neutral `core` and independent bindings for each framework.

```
src/
├── core/   ← Web APIs only, zero dependencies
└── vue/    ← depends on core + vue
```

Dependencies always point toward `core`. Bindings do not depend on each other.

## File Structure

```
src/
├── core/
│   ├── index.ts                         # Public API: re-exports from src/
│   └── src/
│       ├── index.ts                     # Core public API
│       ├── base/
│       │   └── BaseAnimation.ts         # Abstract contract: play() / reverse()
│       ├── animations/
│       │   ├── AnimationRunner.ts       # Parallel orchestrator
│       │   └── CardMoveAnimation.ts     # FLIP via Web Animations API
│       ├── builders/
│       │   └── AnimationBuilder.ts      # Fluent builder (entry point)
│       ├── calculators/
│       │   └── TrajectoryCalculator.ts  # FLIP calculation: before() → calculate()
│       └── types/
│           ├── index.ts                 # Re-exports all types
│           ├── animation.ts             # CardMoveOptions, BuilderConfig, AnimationConstructor
│           └── trajectory.ts            # Trajectory
└── vue/
    ├── index.ts                         # Vue binding public API
    └── composables/
        └── useCardAnimation.ts          # Composable with ref(isAnimating)
```

## FLIP Pipeline

```
builder.snapshot(cards)
  ↓  TrajectoryCalculator.before(cards)     ← First: record positions
──── DOM change ────
builder.buildAnimation(cards)
  ↓  TrajectoryCalculator.calculate(cards)  ← Last + Invert: compute deltas
  ↓  for each card that moved:
  ↓  new AnimationClass(el, trajectory, options)   ← CardMoveAnimation or use()
     AnimationRunner.add(animation)
runner.play()
  ↓  animation.play()                       ← Play: Web Animations API
```

## Dependency Rules

```
          core/
      (Web APIs only)
           ↑
         vue/
```

- ✅ `vue/` → `core/`
- ❌ `core/` → `vue/`

## Adding a New Animation Type

### Option 1: via use() (no library changes needed)

```typescript
import { AnimationBuilder, BaseAnimation } from '@motionlab/motionkit/core';
import type { Trajectory, CardMoveOptions } from '@motionlab/motionkit/core';

class CardFadeAnimation extends BaseAnimation {
  readonly #element: HTMLElement;
  readonly #duration: number;
  #animation: Animation | null = null;

  constructor(element: HTMLElement, _trajectory: Trajectory, options: CardMoveOptions = {}) {
    super();
    this.#element = element;
    this.#duration = options.duration ?? 300;
  }

  override play(): Promise<void> {
    this.#animation = this.#element.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: this.#duration, fill: 'backwards' }
    );
    return this.#animation.finished.then(() => undefined);
  }

  override reverse(): Promise<void> {
    this.#animation = this.#element.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: this.#duration }
    );
    return this.#animation.finished.then(() => undefined);
  }
}

await new AnimationBuilder()
  .use(CardFadeAnimation)
  .withDuration(250)
  .buildAnimation(cards)
  .play();
```

### Option 2: new class inside the library

#### 1. Create the class in `src/core/src/animations/`

```typescript
// src/core/src/animations/CardFadeAnimation.ts
import { BaseAnimation } from '../base/BaseAnimation.ts';
import type { Trajectory, CardMoveOptions } from '../types';

export class CardFadeAnimation extends BaseAnimation {
  // ...implementation as above
}
```

#### 2. Export from `src/core/src/index.ts`

```typescript
export { CardFadeAnimation } from './animations/CardFadeAnimation.ts';
```

#### 3. Use directly via AnimationRunner

```typescript
const runner = new AnimationRunner();
cards.forEach(el => runner.add(new CardFadeAnimation(el, { element: el, deltaX: 0, deltaY: 0 })));
await runner.play();
```

## Key Conventions

| Convention         | Rule                                                              |
|--------------------|-------------------------------------------------------------------|
| File imports       | With `.ts` extension (ESM-only)                                   |
| Directory imports  | Folder path without `index.ts` (`'../types'`, not `'../types/index.ts'`) |
| Private fields     | Native `#field`, not TypeScript `private`                         |
| Fluent methods     | Return `this`                                                     |
| Method override    | `override` keyword is mandatory                                   |
| New animations     | Extend `BaseAnimation` from `base/`                               |

## See Also

- [API Reference](api.md) — detailed docs for all classes
- [Contributing](contributing.md) — how to run and test the project
