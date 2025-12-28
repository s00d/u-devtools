<script setup lang="ts">
import { useCounterStore } from '../stores/counter';

const counter = useCounterStore();
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold text-indigo-600 mb-4">Settings</h1>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 class="text-xl font-semibold mb-4">Store Settings</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input 
            v-model="counter.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Counter Value</label>
          <div class="text-2xl font-bold text-indigo-600">{{ counter.count }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

