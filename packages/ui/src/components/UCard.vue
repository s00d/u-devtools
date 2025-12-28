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
    :class="[
      'border border-udt-c-border rounded-lg bg-udt-c-bg overflow-hidden',
      hover ? 'hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors' : '',
    ]"
  >
    <div v-if="title || subtitle" class="border-b border-udt-c-border bg-gray-50 dark:bg-gray-800 px-4 py-3">
      <h3 v-if="title" class="font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
    <div :class="padding !== false ? 'p-4' : ''">
      <slot />
    </div>
  </div>
</template>

