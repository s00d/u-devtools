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
    <span :style="{ color: 'var(--udt-text-dim)' }">&lt;</span>
    <span class="text-indigo-400 font-bold">{{ tagName }}</span>
    
    <span v-if="id" class="text-yellow-500">
      <span :style="{ color: 'var(--udt-text-dim)' }">id="</span>{{ id }}<span :style="{ color: 'var(--udt-text-dim)' }">"</span>
    </span>
    
    <span v-if="classes && classes.length > 0" class="text-blue-400 truncate max-w-[120px]">
      <span :style="{ color: 'var(--udt-text-dim)' }">class="</span>{{ classes.join(' ') }}<span :style="{ color: 'var(--udt-text-dim)' }">"</span>
    </span>
    
    <span :style="{ color: 'var(--udt-text-dim)' }">{{ hasChildren ? '&gt;' : '/&gt;' }}</span>
  </div>
</template>

