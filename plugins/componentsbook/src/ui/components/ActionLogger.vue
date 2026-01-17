<script setup lang="ts">
import { UButton, UIcon, UJsonTree } from '@u-devtools/ui';
import type { ActionLog } from '../../types';

defineProps<{
  logs: ActionLog[];
}>();

defineEmits<{
  clear: [];
}>();

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString(undefined, { hour12: false, fractionalSecondDigits: 3 });
};
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
      <span class="text-xs font-bold text-gray-400 uppercase">Actions Log</span>
      <UButton size="xs" variant="ghost" icon="Trash" @click="$emit('clear')">Clear</UButton>
    </div>
    
    <div class="flex-1 overflow-auto p-2 space-y-2 bg-gray-900">
      <div v-if="logs.length === 0" class="text-center text-gray-500 py-4 text-sm">
        No events fired yet
      </div>
      
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="bg-gray-800 rounded border border-gray-700 overflow-hidden text-sm"
      >
        <div class="flex items-center justify-between p-2 bg-gray-800/50 border-b border-gray-700/50">
          <div class="flex items-center gap-2">
            <span class="text-green-400 font-mono font-bold">@{{ log.name }}</span>
            <span class="text-[10px] text-gray-500 font-mono">{{ formatTime(log.timestamp) }}</span>
          </div>
        </div>
        <div class="p-2 bg-gray-900/50">
           <UJsonTree :data="log.payload" :deep="1" />
        </div>
      </div>
    </div>
  </div>
</template>
