<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  fileName: string;
  filePath: string;
  activeTab: string;
}>();

const emit = defineEmits<{
  'update:activeTab': [tab: string];
}>();

const tabs = ['Preview', 'Source', 'Docs'];

const handleTabClick = (tab: string) => {
  emit('update:activeTab', tab);
};
</script>

<template>
  <div class="h-12 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-4 flex-shrink-0">
    <div class="flex items-center gap-3 overflow-hidden">
      <h2 class="text-sm font-bold text-white truncate">{{ fileName }}</h2>
      <span class="text-[10px] text-gray-500 font-mono truncate opacity-60">{{ filePath }}</span>
    </div>
    
    <!-- Main Tabs -->
    <div class="flex gap-1 bg-gray-900 rounded p-0.5 border border-gray-700">
      <button 
        v-for="tab in tabs" 
        :key="tab"
        @click="handleTabClick(tab)"
        class="px-3 py-1 text-xs font-medium rounded transition-all"
        :class="activeTab === tab ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-gray-200'"
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>
