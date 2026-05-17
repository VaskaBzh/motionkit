<template>
  <div class="demo-layout">
    <header class="demo-header">
      <h1>motion<span>.js</span> demo</h1>
      <button class="btn-shuffle" :disabled="isAnimating" @click="shuffle">
        {{ isAnimating ? 'Анимация…' : 'Перемешать' }}
      </button>
    </header>

    <div class="controls">
      <label class="control">
        <span class="control__label">duration</span>
        <div class="control__row">
          <input type="range" min="100" max="3000" step="50" v-model.number="duration" />
          <span class="control__value">{{ duration }}ms</span>
        </div>
      </label>

      <label class="control">
        <span class="control__label">stagger</span>
        <div class="control__row">
          <input type="range" min="0" max="300" step="10" v-model.number="stagger" />
          <span class="control__value">{{ stagger }}ms</span>
        </div>
      </label>

      <label class="control">
        <span class="control__label">easing</span>
        <div class="control__row">
          <select v-model="easing">
            <option value="ease">ease</option>
            <option value="ease-in">ease-in</option>
            <option value="ease-out">ease-out</option>
            <option value="ease-in-out">ease-in-out</option>
            <option value="linear">linear</option>
            <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">spring</option>
          </select>
        </div>
      </label>
    </div>

    <div class="card-grid">
      <div
          v-for="card in cards"
          :key="card.id"
          ref="cards"
          class="card"
          :style="{ '--card-color': card.color }"
      >
        <span class="card__title">{{ card.title }}</span>
        <span class="card__id">#{{ card.id }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue';
import { AnimationBuilder } from '../src/core/src';

interface Card {
  id: number;
  title: string;
  color: string;
}

const cards = ref<Card[]>([
  { id: 1, title: 'Карточка A', color: '#ef4444' },
  { id: 2, title: 'Карточка B', color: '#f97316' },
  { id: 3, title: 'Карточка C', color: '#eab308' },
  { id: 4, title: 'Карточка D', color: '#22c55e' },
  { id: 5, title: 'Карточка E', color: '#3b82f6' },
  { id: 6, title: 'Карточка F', color: '#a855f7' },
]);

const cardEls = useTemplateRef<HTMLElement[]>('cards');
const builder = new AnimationBuilder();

const duration = ref(500);
const stagger = ref(30);
const easing = ref('ease');
const isAnimating = ref(false);

function shuffleArray(arr: Card[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

async function shuffle(): Promise<void> {
  builder
    .withDuration(duration.value)
    .withStagger(stagger.value)
    .withEasing(easing.value);

  builder.snapshot(cardEls.value ?? []);
  shuffleArray(cards.value);
  await nextTick();

  isAnimating.value = true;
  try {
    await builder.buildAnimation(cardEls.value ?? []).play();
  } finally {
    isAnimating.value = false;
  }
}
</script>
