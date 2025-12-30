<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  padding?: boolean;
  hover?: boolean;
}>();
</script>

<template>
  <div
    class="rounded-xl overflow-hidden shadow-sm transition-colors duration-300 border border-zinc-800 bg-zinc-800"
    :class="hover ? 'hover:border-indigo-500/30' : ''"
  >
    <div 
      v-if="title || subtitle" 
      class="px-5 py-4 border-b border-zinc-800"
    >
      <h3 v-if="title" class="font-semibold text-base tracking-tight text-gray-200">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs mt-0.5 text-gray-400">{{ subtitle }}</p>
    </div>
    <div :class="padding !== false ? 'p-5' : ''">
      <slot />
    </div>
  </div>
</template>

