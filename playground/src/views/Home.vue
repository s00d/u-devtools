<script setup lang="ts">
import { ref } from 'vue';
import { useCounterStore } from '../stores/counter';

const counter = useCounterStore();

const requestStatus = ref('Idle');

const makeFetch = async (url: string) => {
  requestStatus.value = 'Fetching...';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();
    console.log('Fetch Data:', data);
    requestStatus.value = 'Fetch Success';
  } catch (e: any) {
    console.error('Fetch Error:', e);
    requestStatus.value = `Fetch Error: ${e.message}`;
  }
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <header class="mb-8 border-b pb-4">
      <h1 class="text-3xl font-bold text-indigo-600 mb-2">🛠 Universal DevTools Kit</h1>
      <p class="text-gray-600">
        This playground demonstrates the capabilities of the DevTools plugins.
        Open the DevTools (bottom-right button) to interact.
      </p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      
      <!-- Pinia Store Demo -->
      <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
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

      <!-- Network Plugin Test Zone -->
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

      <!-- I18n Plugin Test Zone -->
      <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🌍</span> I18n Editor
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          Open the <b>I18n</b> tab in DevTools. Try editing <code>src/locales/en.json</code> and hit Save.
        </p>

        <div class="bg-gray-50 p-4 rounded border border-gray-200 font-mono text-sm space-y-2">
          <div>
            <span class="text-gray-400">app.title:</span>
            <span class="text-indigo-600 font-bold"> "DevTools Playground"</span>
          </div>
          <div>
            <span class="text-gray-400">app.subtitle:</span>
            <span class="text-indigo-600"> "Test your plugins here"</span>
          </div>
        </div>
      </section>

      <!-- Inspector Plugin Test Zone -->
      <section class="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🔍</span> DOM Inspector
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          Open the <b>Inspector</b> tab, click "Select Element", and hover over the items below.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 border rounded bg-indigo-50 border-indigo-100 hover:border-indigo-300 transition" data-test-id="card-1">
            <h3 class="font-bold text-indigo-800">Card Element</h3>
            <p class="text-sm text-indigo-600 mt-1">Inspect me! I have attributes.</p>
          </div>
          
          <div class="p-4 border rounded bg-purple-50 border-purple-100">
            <h3 class="font-bold text-purple-800">List Container</h3>
            <ul class="list-disc list-inside mt-2 text-sm text-purple-700">
              <li>Item A</li>
              <li>Item B</li>
              <li>Item C</li>
            </ul>
          </div>

          <div class="p-4 border rounded bg-amber-50 border-amber-100 flex items-center justify-center">
            <button class="bg-amber-500 text-white px-4 py-2 rounded shadow hover:bg-amber-600 transition">
              Interactive Button
            </button>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

