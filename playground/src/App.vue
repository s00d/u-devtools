<script setup lang="ts">
import { ref } from 'vue';

// --- Network Tests ---
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

const makeXHR = (url: string) => {
  requestStatus.value = 'XHR Sending...';
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => {
    console.log('XHR Response:', xhr.responseText);
    requestStatus.value = `XHR Status: ${xhr.status}`;
  };
  xhr.onerror = () => {
    requestStatus.value = 'XHR Error';
  };
  xhr.send();
};

// --- Inspector Tests ---
const listItems = ref(['Item A', 'Item B', 'Item C']);
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
      
      <!-- 1. Network Plugin Test Zone -->
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

          <div class="flex flex-wrap gap-2">
            <button 
              @click="makeXHR('https://jsonplaceholder.typicode.com/users/1')"
              class="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
            >
              XHR (Success)
            </button>
            <button 
              @click="makeXHR('https://httpstat.us/500')"
              class="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded hover:bg-orange-100"
            >
              XHR (500 Error)
            </button>
          </div>
          
          <div class="text-xs font-mono bg-gray-100 p-2 rounded mt-2">
            Status: {{ requestStatus }}
          </div>
        </div>
      </section>

      <!-- 2. I18n Plugin Test Zone -->
      <section class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span>🌍</span> I18n Editor
        </h2>
        <p class="text-sm text-gray-500 mb-4">
          Open the <b>I18n</b> tab in DevTools. Try editing <code>src/locales/en.json</code> and hit Save. The keys below represent the file structure.
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
          <div>
            <span class="text-gray-400">messages.welcome:</span>
            <span class="text-green-600"> "Welcome to the demo app!"</span>
          </div>
        </div>
      </section>

      <!-- 3. Inspector Plugin Test Zone -->
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
              <li v-for="item in listItems" :key="item">{{ item }}</li>
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

