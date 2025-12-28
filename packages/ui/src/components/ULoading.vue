<script setup lang="ts">
defineProps<{
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400',
      fullscreen ? 'fixed inset-0 bg-white/50 dark:bg-gray-900/50 z-50' : '',
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : '',
    ]"
  >
    <div
      :class="[
        'i-carbon-circle-dash animate-spin',
        size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-2xl',
        'text-indigo-500',
      ]"
    />
    <span v-if="text">{{ text }}</span>
  </div>
</template>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>

