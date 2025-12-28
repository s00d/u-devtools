<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <h1 class="text-3xl font-bold text-indigo-600 mb-4">About</h1>
    <p class="text-gray-600 mb-4">
      This is the About page. Check the Vue Router plugin in DevTools to see the current route.
    </p>
    <div class="bg-gray-50 p-4 rounded border border-gray-200">
      <p class="text-sm text-gray-700">
        Current route: <code class="font-mono bg-white px-2 py-1 rounded">{{ route.path }}</code>
      </p>
    </div>
  </div>
</template>

