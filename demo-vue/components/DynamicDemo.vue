<template>
  <div class="dynamic-actions">
    <button class="btn-action" :disabled="isAnimating || full" @click="addStart">+ в начало</button>
    <button class="btn-action" :disabled="isAnimating || full" @click="addEnd">+ в конец</button>
    <button class="btn-action" :disabled="isAnimating || full" @click="addMiddle">+ в середину</button>
    <button class="btn-action" :disabled="isAnimating || empty" @click="removeFirst">− первую</button>
    <button class="btn-action" :disabled="isAnimating || empty" @click="removeLast">− последнюю</button>
    <span class="card-counter">{{ cards.length }} / {{ MAX_CARDS }} карточек</span>
  </div>

  <div class="card-grid">
    <div
      v-for="card in cards"
      :key="card.id"
      ref="cardEls"
      class="card"
      :style="{ '--card-color': card.color }"
    >
      <span class="card__title">{{ card.title }}</span>
      <span class="card__id">#{{ card.id }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, useTemplateRef } from 'vue';
import { useCardAnimation } from '../../src/vue';

interface Card {
  id: number;
  title: string;
  color: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];
const LABELS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta'];
const MAX_CARDS = 12;

let nextId = 5;
function newCard(): Card {
  const idx = nextId % COLORS.length;
  return { id: nextId++, title: `Карточка ${LABELS[idx] ?? String(nextId)}`, color: COLORS[idx] ?? '#6366f1' };
}

const cards = ref<Card[]>([
  { id: 1, title: 'Карточка Alpha', color: COLORS[0] },
  { id: 2, title: 'Карточка Beta', color: COLORS[1] },
  { id: 3, title: 'Карточка Gamma', color: COLORS[2] },
  { id: 4, title: 'Карточка Delta', color: COLORS[3] },
]);

const full = computed(() => cards.value.length >= MAX_CARDS);
const empty = computed(() => cards.value.length === 0);

const cardEls = useTemplateRef<HTMLElement[]>('cardEls');
const { snapshot, animateMove, isAnimating } = useCardAnimation({ duration: 400, stagger: 25 });

async function triggerChange(updater: () => void): Promise<void> {
  snapshot(cardEls.value ?? []);
  updater();
  await nextTick();
  await animateMove(cardEls.value ?? []);
}

function addStart(): void { void triggerChange(() => { cards.value = [newCard(), ...cards.value]; }); }
function addEnd(): void { void triggerChange(() => { cards.value = [...cards.value, newCard()]; }); }
function addMiddle(): void {
  void triggerChange(() => {
    const mid = Math.floor(cards.value.length / 2);
    cards.value = [...cards.value.slice(0, mid), newCard(), ...cards.value.slice(mid)];
  });
}
function removeFirst(): void { void triggerChange(() => { cards.value = cards.value.slice(1); }); }
function removeLast(): void { void triggerChange(() => { cards.value = cards.value.slice(0, -1); }); }
</script>
