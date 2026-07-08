[Back to README](../README.md) · [API Reference →](api.md)

# React Integration

`@motionlab/motionkit/react` provides the `useCardAnimation` hook — a React equivalent of the Vue composable with an identical FLIP API.

## Installation

```bash
npm install @motionlab/motionkit react react-dom
```

## API

### `useCardAnimation(options?)`

```typescript
import { useCardAnimation } from '@motionlab/motionkit/react';

const { snapshot, animateMove, isAnimating } = useCardAnimation(options);
```

**`CardAnimationHookOptions` parameters:**

| Parameter  | Type     | Default  | Description                        |
|------------|----------|----------|------------------------------------|
| `duration` | `number` | `300`    | Animation duration in ms           |
| `easing`   | `string` | `'ease'` | CSS easing function                |
| `stagger`  | `number` | `0`      | Delay between adjacent cards in ms |
| `delay`    | `number` | `0`      | Initial delay before animation     |

**Returns `UseCardAnimationReturn`:**

| Field         | Type                                              | Description                           |
|---------------|---------------------------------------------------|---------------------------------------|
| `snapshot`    | `(cards: Iterable<HTMLElement>) => void`          | Records positions before DOM change   |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>` | Plays FLIP animation after DOM change |
| `isAnimating` | `boolean`                                         | `true` while animation is running     |

> Unlike Vue, `isAnimating` is a plain `boolean` (not `Ref<boolean>`). React manages re-renders via `useState` inside the hook.

## FLIP Pattern in React

The key difference from Vue — React has no `nextTick`. The correct pattern is: `snapshot` → `setState` → `useEffect` → `animateMove`.

```tsx
const cardRefs = useRef<(HTMLElement | null)[]>([]);
const shouldAnimate = useRef(false); // signal: "animate after next render"

const handleReorder = () => {
  // 1. Snapshot positions BEFORE state change
  snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  shouldAnimate.current = true;
  // 2. Update state → React re-renders the DOM
  setCards(prev => reorder(prev));
};

useEffect(() => {
  // 3. Play animation AFTER render
  if (!shouldAnimate.current) return;
  shouldAnimate.current = false;
  void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
}, [cards, animateMove]);
```

Populate the ref array with a callback ref:

```tsx
{cards.map((card, i) => (
  <div key={card.id} ref={el => { cardRefs.current[i] = el; }}>
    {card.title}
  </div>
))}
```

## Example: ShuffleDemo

Shuffle 6 cards with configurable parameters:

```tsx
import { useState, useRef, useEffect } from 'react';
import { useCardAnimation } from '@motionlab/motionkit/react';

interface Card { id: number; title: string; color: string }

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function ShuffleDemo() {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, title: 'A', color: '#ef4444' },
    { id: 2, title: 'B', color: '#f97316' },
    { id: 3, title: 'C', color: '#22c55e' },
  ]);

  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 500, stagger: 30 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  }, [cards, animateMove]);

  const handleShuffle = () => {
    snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
    shouldAnimate.current = true;
    setCards(prev => shuffleArray(prev));
  };

  return (
    <>
      <button onClick={handleShuffle} disabled={isAnimating}>Shuffle</button>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {cards.map((card, i) => (
          <div
            key={card.id}
            ref={el => { cardRefs.current[i] = el; }}
            style={{ background: card.color, padding: 20, borderRadius: 12 }}
          >
            {card.title}
          </div>
        ))}
      </div>
    </>
  );
}
```

## Example: DynamicDemo

Add and remove cards with animated shifting:

```tsx
export function DynamicDemo() {
  const [cards, setCards] = useState<Card[]>(initialCards);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shouldAnimate = useRef(false);
  const { snapshot, animateMove } = useCardAnimation({ duration: 400, stagger: 25 });

  useEffect(() => {
    if (!shouldAnimate.current) return;
    shouldAnimate.current = false;
    void animateMove(cardRefs.current.filter((el): el is HTMLElement => el !== null));
  }, [cards, animateMove]);

  const trigger = (updater: (prev: Card[]) => Card[]) => {
    snapshot(cardRefs.current.filter((el): el is HTMLElement => el !== null));
    shouldAnimate.current = true;
    setCards(updater);
  };

  return (
    <>
      <button onClick={() => trigger(prev => [newCard(), ...prev])}>+ prepend</button>
      <button onClick={() => trigger(prev => [...prev, newCard()])}>+ append</button>
      <button onClick={() => trigger(prev => prev.slice(1))}>− remove first</button>
      {/* ... */}
    </>
  );
}
```

## Differences from Vue

| Aspect            | Vue 3                              | React                           |
|-------------------|------------------------------------|---------------------------------|
| `isAnimating`     | `Ref<boolean>` (`.value`)          | `boolean` (direct)              |
| After DOM change  | `await nextTick()`                 | `useEffect([cards])`            |
| Animation signal  | implicit via call order            | `shouldAnimate` ref             |
| Builder stability | created once in setup              | `useRef(new AnimationBuilder())`|
