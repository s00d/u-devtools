<script setup lang="ts">
import UIcon from './UIcon.vue';

defineProps<{
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}>();
</script>

<template>
  <div
    :class="[
      'flex items-center justify-center gap-2 text-gray-400',
      fullscreen ? 'fixed inset-0 bg-gray-900/50 z-50' : '',
      size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : '',
    ]"
  >
    <UIcon
      name="ArrowPath"
      :size="size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'"
      class="animate-spin text-indigo-500"
    />
    <span v-if="text">{{ text }}</span>
  </div>
</template>

