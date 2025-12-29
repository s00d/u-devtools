<script setup lang="ts">
import { UStat } from '@u-devtools/ui';
import type { ElementInfo } from '../../composables/useElementData';

defineProps<{
  data: ElementInfo;
}>();
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="grid grid-cols-2 gap-3">
      <UStat 
        label="Role" 
        :value="data.a11y?.role || '-'" 
        color="indigo"
      />
      <UStat 
        label="Tab Index" 
        :value="String(data.a11y?.tabIndex ?? '-')" 
        color="blue"
      />
    </div>
    
    <div class="border border-gray-800 rounded-lg bg-gray-800 overflow-hidden">
      <div class="border-b border-gray-800 bg-gray-800 px-4 py-2.5">
        <h3 class="font-semibold text-gray-200 text-xs uppercase">Accessibility Attributes</h3>
      </div>
      <div class="p-4">
        <div class="space-y-1">
          <div 
            v-for="item in [
              { label: 'aria-label', value: data.a11y?.ariaLabel || '-' },
              { label: 'aria-hidden', value: data.a11y?.ariaHidden || '-' },
              { label: 'Alt Text', value: data.a11y?.alt || '-' },
              { label: 'Title', value: data.a11y?.title || '-' }
            ]" 
            :key="item.label"
            class="flex items-start gap-4 py-2 border-b border-gray-800 last:border-0 hover:bg-gray-900/50 transition-colors"
          >
            <div class="font-medium text-gray-400 w-32 flex-shrink-0 text-xs">{{ item.label }}</div>
            <div class="flex-1 text-gray-200 break-all text-xs font-mono">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
