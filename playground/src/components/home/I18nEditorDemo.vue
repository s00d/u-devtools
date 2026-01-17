<script setup lang="ts">
// No props or state needed
</script>

<template>
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
</template>
