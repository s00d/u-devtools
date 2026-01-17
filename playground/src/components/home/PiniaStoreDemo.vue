<script setup lang="ts">
import { useCounterStore } from '../../stores/counter';

const counter = useCounterStore();
</script>

<template>
  <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2 text-left italic">
      <span>📦</span> Pinia Store
    </h2>
    <p class="text-sm text-gray-500 mb-4">
      Counter store: {{ counter.count }} (double: {{ counter.doubleCount }})
    </p>
    <div class="flex gap-2">
      <button 
        @click="counter.increment"
        class="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
      >
        +1
      </button>
      <button 
        @click="counter.decrement"
        class="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
      >
        -1
      </button>
      <button 
        @click="counter.reset"
        class="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  </section>
</template>
