[Back to README](../README.md) · [API Reference →](api.md)

# Vue 3 Integration

`@motionlab/motionkit/vue` provides the `useCardAnimation` composable for Vue 3 — a thin wrapper around the core FLIP engine with a reactive `isAnimating` flag.

## Installation

```bash
npm install @motionlab/motionkit vue
```

## API

### `useCardAnimation(options?)`

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';

const { snapshot, animateMove, isAnimating } = useCardAnimation(options);
```

**`CardAnimationComposableOptions` parameters:**

| Parameter  | Type     | Default  | Description                        |
|------------|----------|----------|------------------------------------|
| `duration` | `number` | `300`    | Animation duration in ms           |
| `easing`   | `string` | `'ease'` | CSS easing function                |
| `stagger`  | `number` | `0`      | Delay between adjacent cards in ms |

**Returns `UseCardAnimationReturn`:**

| Field         | Type                                              | Description                                    |
|---------------|---------------------------------------------------|------------------------------------------------|
| `snapshot`    | `(cards: Iterable<HTMLElement>) => void`          | Records positions before DOM change            |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>` | Plays FLIP animation after DOM change          |
| `isAnimating` | `Ref<boolean>`                                    | `true` while animation is running              |

> `isAnimating` is a reactive `Ref<boolean>`. Use `.value` in `<script setup>` and directly in the template.

## FLIP Pattern in Vue 3

```vue
<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue';
import { useCardAnimation } from '@motionlab/motionkit/vue';

const cards = ref([...]);
const cardEls = useTemplateRef<HTMLElement[]>('cards');

const { snapshot, animateMove, isAnimating } = useCardAnimation({
  duration: 350,
  stagger: 30,
});

async function onReorder() {
  // 1. Snapshot positions BEFORE DOM change
  snapshot(cardEls.value ?? []);
  // 2. Update reactive data → Vue will update the DOM
  cards.value = reorder(cards.value);
  // 3. Wait for the next tick — DOM is now updated
  await nextTick();
  // 4. Play animation
  await animateMove(cardEls.value ?? []);
}
</script>

<template>
  <button :disabled="isAnimating" @click="onReorder">Shuffle</button>
  <div class="card-grid">
    <div v-for="card in cards" :key="card.id" ref="cards" class="card">
      {{ card.title }}
    </div>
  </div>
</template>
```

## Example: ShuffleDemo

```vue
<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue';
import { useCardAnimation } from '@motionlab/motionkit/vue';

interface Card { id: number; title: string; color: string }

const cards = ref<Card[]>([
  { id: 1, title: 'Card A', color: '#ef4444' },
  { id: 2, title: 'Card B', color: '#f97316' },
  { id: 3, title: 'Card C', color: '#22c55e' },
]);

const cardEls = useTemplateRef<HTMLElement[]>('cards');
const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 500, stagger: 30 });

function shuffleArray(arr: Card[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

async function shuffle() {
  snapshot(cardEls.value ?? []);
  shuffleArray(cards.value);
  await nextTick();
  await animateMove(cardEls.value ?? []);
}
</script>

<template>
  <button :disabled="isAnimating" @click="shuffle">
    {{ isAnimating ? 'Animating…' : 'Shuffle' }}
  </button>
  <div class="card-grid">
    <div
      v-for="card in cards"
      :key="card.id"
      ref="cards"
      class="card"
      :style="{ '--card-color': card.color }"
    >
      <span>{{ card.title }}</span>
    </div>
  </div>
</template>
```

## Differences from React

| Aspect             | Vue 3                              | React                          |
|--------------------|------------------------------------|--------------------------------|
| `isAnimating`      | `Ref<boolean>` (`.value`)          | `boolean` (direct)             |
| After DOM change   | `await nextTick()`                 | `useEffect([cards])`           |
| Element binding    | `useTemplateRef` / `ref="cards"`   | `useRef` + callback ref        |
| Builder stability  | created once in `setup`            | `useRef(new AnimationBuilder())`|

See the React variant: [docs/react.md](react.md)
