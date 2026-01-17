<script setup lang="ts">
import { ref } from 'vue';

const requestStatus = ref('Idle');

const makeFetch = async (url: string) => {
  requestStatus.value = 'Fetching...';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log('Fetch Data:', data);
    requestStatus.value = 'Fetch Success';
  } catch (e: unknown) {
    console.error('Fetch Error:', e);
    const message = e instanceof Error ? e.message : 'Unknown error';
    requestStatus.value = `Fetch Error: ${message}`;
  }
};
</script>

<template>
  <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <span>📡</span> Network Logger
    </h2>
    <p class="text-sm text-gray-500 mb-4">
      Click these buttons to generate network traffic. Open the <b>Network</b> tab in DevTools to see them.
    </p>
    
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        <button 
          @click="makeFetch('https://jsonplaceholder.typicode.com/todos/1')"
          class="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100"
        >
          Fetch (200 OK)
        </button>
        <button 
          @click="makeFetch('https://jsonplaceholder.typicode.com/invalid-url')"
          class="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100"
        >
          Fetch (404/Error)
        </button>
      </div>
      
      <div class="text-xs font-mono bg-gray-100 p-2 rounded mt-2">
        Status: {{ requestStatus }}
      </div>
    </div>
  </section>
</template>
