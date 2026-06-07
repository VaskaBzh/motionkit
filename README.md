# @motionlab/motionkit

> Smooth FLIP card animations in TypeScript. Zero dependencies.

A TypeScript library for animating HTML card reordering using the **FLIP** technique (First → Last → Invert → Play). Powered by the native Web Animations API — no runtime dependencies.

## Quick Start

```bash
npm install @motionlab/motionkit
```

```typescript
import { AnimationBuilder } from '@motionlab/motionkit/core';

const builder = new AnimationBuilder()
  .withDuration(350)
  .withEasing('cubic-bezier(0.4, 0, 0.2, 1)')
  .withStagger(30);

// Before DOM change
builder.snapshot(cards);

// Reorder elements...
reorderCards();

// After DOM change — play animation
await builder.buildAnimation(cards).play();
```

## Features

- **FLIP technique** — smooth card movement without layout thrashing
- **Web Animations API** — native browser API, no dependencies
- **Fluent builder** — readable DSL for animation configuration
- **Stagger** — wave delay effect between cards
- **Plugin API** — plug in your own animation class via `.use()`
- **Vue 3** — ready-to-use composable `useCardAnimation`
- **React** — hook `useCardAnimation` with FLIP pattern support
- **Angular** — `CardAnimationService` with Angular Signals and DI
- **TypeScript** — full typings out of the box

## Vue 3

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';

const { snapshot, animateMove, isAnimating } = useCardAnimation({
  duration: 350,
  stagger: 30,
});

async function onReorder() {
  snapshot(cards.value);
  reorderCards();
  await nextTick();
  await animateMove(cards.value);
}
```

## React

```tsx
import { useRef, useState, useEffect } from 'react';
import { useCardAnimation } from '@motionlab/motionkit/react';

function MyList() {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const [cards, setCards] = useState([...]);
  const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 400, stagger: 30 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter(Boolean));
  }, [cards, animateMove]);

  const shuffle = () => {
    snapshot(cardRefs.current.filter(Boolean));
    shouldAnimate.current = true;
    setCards(prev => shuffleArray([...prev]));
  };
}
```

## Angular

```typescript
import { CardAnimationService } from '@motionlab/motionkit/angular';

@Component({
  providers: [CardAnimationService],
})
export class MyComponent {
  private anim = inject(CardAnimationService);

  async shuffle() {
    await this.anim.animate(
      () => this.cardEls().map(r => r.nativeElement),
      () => this.cards.update(arr => shuffleArray(arr)),
    );
  }
}
```

---

## Documentation

| Section | Description |
|---------|-------------|
| [Getting Started](docs/getting-started.md) | Installation, setup, first steps |
| [Vue 3](docs/vue.md) | `useCardAnimation` composable, FLIP pattern, examples |
| [React](docs/react.md) | `useCardAnimation` hook, FLIP pattern, examples |
| [Angular](docs/angular.md) | `CardAnimationService`, Signals, DI setup |
| [API Reference](docs/api.md) | Classes, methods, types |

## For Contributors

| Section | Description |
|---------|-------------|
| [Architecture](docs/architecture.md) | Project structure, extending the library |
| [Contributing](docs/contributing.md) | Dev setup, commands, testing |

## License

MIT
