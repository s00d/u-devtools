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
    class="rounded-xl overflow-hidden shadow-sm transition-colors duration-300"
    :style="{
      border: '1px solid var(--udt-border)',
      backgroundColor: 'var(--udt-bg-surface)'
    }"
    :class="hover ? 'hover:border-indigo-500/30' : ''"
  >
    <div 
      v-if="title || subtitle" 
      class="px-5 py-4 border-b"
      :style="{ borderColor: 'var(--udt-border)' }"
    >
      <h3 v-if="title" class="font-semibold text-base tracking-tight" :style="{ color: 'var(--udt-text)' }">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs mt-0.5" :style="{ color: 'var(--udt-text-dim)' }">{{ subtitle }}</p>
    </div>
    <div :class="padding !== false ? 'p-5' : ''">
      <slot />
    </div>
  </div>
</template>

