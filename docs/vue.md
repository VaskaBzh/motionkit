# Vue 3 integration

`@motionlab/motionkit/vue` предоставляет composable `useCardAnimation` для Vue 3 — тонкую обёртку над core FLIP-движком с реактивным флагом `isAnimating`.

## Установка

```bash
npm install @motionlab/motionkit vue
```

## API

### `useCardAnimation(options?)`

```typescript
import { useCardAnimation } from '@motionlab/motionkit/vue';

const { snapshot, animateMove, isAnimating } = useCardAnimation(options);
```

**Параметры `CardAnimationComposableOptions`:**

| Параметр   | Тип      | По умолчанию | Описание                              |
|------------|----------|--------------|---------------------------------------|
| `duration` | `number` | `300`        | Длительность анимации в мс            |
| `easing`   | `string` | `'ease'`     | CSS-функция плавности                 |
| `stagger`  | `number` | `0`          | Задержка между соседними карточками   |

**Возвращает `UseCardAnimationReturn`:**

| Поле          | Тип                                              | Описание                                 |
|---------------|--------------------------------------------------|------------------------------------------|
| `snapshot`    | `(cards: Iterable<HTMLElement>) => void`         | Запоминает позиции до изменения DOM      |
| `animateMove` | `(cards: Iterable<HTMLElement>) => Promise<void>`| Запускает FLIP-анимацию после DOM-смены  |
| `isAnimating` | `Ref<boolean>`                                   | `true` пока идёт анимация                |

> `isAnimating` — реактивный `Ref<boolean>`. Используй `.value` в `<script setup>` и напрямую в шаблоне.

## FLIP-паттерн в Vue 3

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
  // 1. Снимок позиций ДО изменения DOM
  snapshot(cardEls.value ?? []);
  // 2. Изменяем реактивные данные → Vue обновит DOM
  cards.value = reorder(cards.value);
  // 3. Ждём следующий тик — DOM уже обновлён
  await nextTick();
  // 4. Запускаем анимацию
  await animateMove(cardEls.value ?? []);
}
</script>

<template>
  <button :disabled="isAnimating" @click="onReorder">Перемешать</button>
  <div class="card-grid">
    <div v-for="card in cards" :key="card.id" ref="cards" class="card">
      {{ card.title }}
    </div>
  </div>
</template>
```

## Пример: ShuffleDemo

```vue
<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue';
import { useCardAnimation } from '@motionlab/motionkit/vue';

interface Card { id: number; title: string; color: string }

const cards = ref<Card[]>([
  { id: 1, title: 'Карточка A', color: '#ef4444' },
  { id: 2, title: 'Карточка B', color: '#f97316' },
  { id: 3, title: 'Карточка C', color: '#22c55e' },
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
    {{ isAnimating ? 'Анимация…' : 'Перемешать' }}
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

## Отличия от React

| Аспект | Vue 3 | React |
|---|---|---|
| `isAnimating` | `Ref<boolean>` (`.value`) | `boolean` (напрямую) |
| После DOM-изменения | `await nextTick()` | `useEffect([cards])` |
| Привязка элементов | `useTemplateRef` / `ref="cards"` | `useRef` + callback ref |
| Стабильность builder | создаётся один раз в `setup` | `useRef(new AnimationBuilder())` |

Подробнее о React-варианте: [docs/react.md](react.md)
