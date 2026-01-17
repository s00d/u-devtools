<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center bg-gray-900 text-gray-500">
    <div class="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-gray-700">
      <UIcon name="Squares2X2" class="w-10 h-10 opacity-50" />
    </div>
    <p class="text-xl font-bold text-gray-300 mb-2">Select a component</p>
    <p class="text-sm text-gray-500 max-w-xs text-center">
      Choose a story file from the sidebar to view component preview, source code and documentation.
    </p>
  </div>
</template>
