---
to: <%= projectName %>/src/views/LayoutComponents.vue
---
<script setup lang="ts">
import { UCard } from '@u-devtools/ui';
</script>

<template>
  <div class="space-y-6">
    <UCard title="Layout Components">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="text-sm font-semibold mb-2">Grid Item 1</h3>
            <p class="text-sm text-gray-400">Content goes here</p>
          </div>
          <div class="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="text-sm font-semibold mb-2">Grid Item 2</h3>
            <p class="text-sm text-gray-400">Content goes here</p>
          </div>
        </div>

        <div class="flex gap-4">
          <div class="flex-1 p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="text-sm font-semibold mb-2">Flex Item 1</h3>
            <p class="text-sm text-gray-400">Flexible width</p>
          </div>
          <div class="flex-1 p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="text-sm font-semibold mb-2">Flex Item 2</h3>
            <p class="text-sm text-gray-400">Flexible width</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

