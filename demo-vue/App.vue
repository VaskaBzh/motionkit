<template>
  <div class="demo-layout">
    <header class="demo-header">
      <h1><a href="./index.html">motion<span>.js</span></a> Vue demo</h1>
      <nav class="tabs">
        <button
          :class="['tab-btn', { 'tab-btn--active': tab === 'shuffle' }]"
          @click="tab = 'shuffle'"
        >Shuffle</button>
        <button
          :class="['tab-btn', { 'tab-btn--active': tab === 'dynamic' }]"
          @click="tab = 'dynamic'"
        >Dynamic</button>
      </nav>
    </header>

    <pre class="usage" v-pre><code>const { snapshot, animateMove } = useCardAnimation({ duration: 500 })
snapshot(cardEls.value)              // First: capture positions
cards.value = shuffle(cards.value)   // reorder
await nextTick(); await animateMove(cardEls.value)   // Invert → Play</code></pre>

    <ShuffleDemo v-if="tab === 'shuffle'" />
    <DynamicDemo v-else />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ShuffleDemo from './components/ShuffleDemo.vue';
import DynamicDemo from './components/DynamicDemo.vue';

type Tab = 'shuffle' | 'dynamic';
const tab = ref<Tab>('shuffle');
</script>
