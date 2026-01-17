<script setup lang="ts">
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';

defineProps<{
  text?: string;
  label?: string; // Alias for text
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
}>();

const loading = tv({
  base: 'flex items-center justify-center gap-2 text-gray-400',
  variants: {
    fullscreen: {
      true: 'fixed inset-0 bg-gray-900/50 z-50',
      false: '',
    },
    size: {
      sm: 'text-sm',
      md: '',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    fullscreen: false,
    size: 'md',
  },
});
</script>

<template>
  <div :class="loading({ fullscreen: fullscreen || false, size })">
    <UIcon
      name="ArrowPath"
      :size="size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'"
      class="animate-spin text-indigo-500"
    />
    <span v-if="text || label">{{ text || label }}</span>
  </div>
</template>

