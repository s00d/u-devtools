<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();

defineSlots<{
  default?: any;
  footer?: any;
}>();
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div v-if="title || description" class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 v-if="title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ title }}
      </h3>
      <p v-if="description" class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </p>
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
      <slot name="footer" />
    </div>
  </div>
</template>

