[Back to README](../README.md) · [API Reference →](api.md)

# Getting Started

## Requirements

- Browser with [Web Animations API](https://caniuse.com/web-animations) support (Chrome 84+, Firefox 75+, Safari 14+)
- TypeScript 5+ (optional — the library ships with `.d.ts` files)

## Installation

```bash
npm install @motionlab/motionkit
# or
yarn add @motionlab/motionkit
# or
pnpm add @motionlab/motionkit
```

## Vanilla TypeScript / JavaScript

Import from the core module:

```typescript
import { AnimationBuilder } from '@motionlab/motionkit/core';
```

### Basic Example

```typescript
const cards = document.querySelectorAll<HTMLElement>('.card');

const builder = new AnimationBuilder()
  .withDuration(300)       // duration in ms (default: 300)
  .withEasing('ease')      // CSS easing function
  .withStagger(0);         // delay between cards in ms

// Step 1: snapshot BEFORE DOM change
builder.snapshot(cards);

// Step 2: reorder cards in the DOM
shuffleCards();

// Step 3: play animation AFTER DOM change
const runner = builder.buildAnimation(cards);
await runner.play();
```

### With Stagger Effect

```typescript
const builder = new AnimationBuilder()
  .withDuration(350)
  .withEasing('cubic-bezier(0.4, 0, 0.2, 1)')
  .withStagger(30);   // each next card starts 30ms later

builder.snapshot(cards);
cards.sort(byNewOrder);  // reorder in DOM
await builder.buildAnimation(cards).play();
```

### With Custom Animation Class

```typescript
import { AnimationBuilder, BaseAnimation } from '@motionlab/motionkit/core';
import type { Trajectory, CardMoveOptions } from '@motionlab/motionkit/core';

class MyAnimation extends BaseAnimation {
  constructor(element: HTMLElement, trajectory: Trajectory, options?: CardMoveOptions) {
    super();
    // ...
  }
  override play(): Promise<void> { /* ... */ }
  override reverse(): Promise<void> { /* ... */ }
}

const runner = new AnimationBuilder()
  .use(MyAnimation)
  .withDuration(400)
  .buildAnimation(cards);

await runner.play();
```

## Vue 3

Install the same package and import from the Vue integration:

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';
```

### Usage in a Component

```vue
<script setup lang="ts">
import { nextTick, useTemplateRef } from 'vue';
import { useCardAnimation } from '@motionlab/motionkit/vue';

const cardRefs = useTemplateRef<HTMLElement[]>('cards');
const { snapshot, animateMove, isAnimating } = useCardAnimation({
  duration: 350,
  stagger: 30,
});

async function onReorder() {
  snapshot(cardRefs.value ?? []);   // snapshot BEFORE change
  items.value.reverse();            // update reactive data
  await nextTick();                 // wait for DOM update
  await animateMove(cardRefs.value ?? []);  // play animation
}
</script>

<template>
  <div>
    <div
      v-for="item in items"
      :key="item.id"
      ref="cards"
      class="card"
    >{{ item.label }}</div>
    <button :disabled="isAnimating" @click="onReorder">
      Shuffle
    </button>
  </div>
</template>
```

## Troubleshooting

After playing the animation, cards should smoothly move to their new positions. If nothing moves:

1. Make sure `snapshot()` is called **before** the DOM change
2. Make sure `buildAnimation()` is called **after** the DOM change (and after `nextTick()` in Vue)
3. Verify that the cards actually moved (the library only animates cards where `deltaX !== 0 || deltaY !== 0`)

## Next Steps

- [API Reference](api.md) — full documentation for all classes and methods
- [Architecture](architecture.md) — library structure and how to extend it
