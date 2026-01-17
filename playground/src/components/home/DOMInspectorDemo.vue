<script setup lang="ts">
// No props or state needed
</script>

<template>
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
</template>
