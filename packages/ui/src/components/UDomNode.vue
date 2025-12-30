<script setup lang="ts">
defineProps<{
  tagName: string;
  id?: string;
  classes?: string[];
  isCurrent?: boolean;
  hasChildren?: boolean;
}>();
</script>

<template>
  <div class="inline-flex items-center gap-1 font-mono text-xs whitespace-nowrap">
    <span class="text-gray-400">&lt;</span>
    <span class="text-indigo-400 font-bold">{{ tagName }}</span>
    
    <span v-if="id" class="text-yellow-500">
      <span class="text-gray-400">id="</span>{{ id }}<span class="text-gray-400">"</span>
    </span>
    
    <span v-if="classes && classes.length > 0" class="text-blue-400 truncate max-w-[120px]">
      <span class="text-gray-400">class="</span>{{ classes.join(' ') }}<span class="text-gray-400">"</span>
    </span>
    
    <span class="text-gray-400">{{ hasChildren ? '&gt;' : '/&gt;' }}</span>
  </div>
</template>

