<script setup lang="ts">
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';

defineProps<{
  icon?: string;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  // Alternative props for React compatibility
  label?: string; // Alias for title
  subtitle?: string; // Alias for description
}>();

const empty = tv({
  base: 'flex flex-col items-center justify-center text-gray-500 gap-4',
  variants: {
    size: {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const emptyIcon = tv({
  base: 'opacity-30',
  variants: {
    size: {
      sm: 'w-16 h-16',
      md: 'w-20 h-20',
      lg: 'w-24 h-24',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
</script>

<template>
  <div :class="empty({ size })">
    <div
      v-if="icon"
      :class="emptyIcon({ size })"
    >
      <UIcon :name="icon" :size="size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'" />
    </div>
    <div v-else class="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center opacity-30">
      <UIcon name="MagnifyingGlass" :size="size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'" />
    </div>
    <div class="text-center">
      <p v-if="title || label" class="font-semibold text-gray-400 mb-1">{{ title || label }}</p>
      <p v-if="description || subtitle" class="text-sm text-gray-500">{{ description || subtitle }}</p>
    </div>
  </div>
</template>

