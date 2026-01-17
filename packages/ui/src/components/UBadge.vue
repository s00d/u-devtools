<script setup lang="ts">
import { tv } from 'tailwind-variants';

defineProps<{
  color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue';
  label?: string | number;
  size?: 'xs' | 'sm' | 'md';
}>();

const badge = tv({
  base: 'rounded font-medium inline-flex items-center justify-center',
  variants: {
    size: {
      xs: 'px-1.5 py-0.5 text-[10px]',
      sm: 'px-1.5 py-0.5 text-xs',
      md: 'px-2 py-0.5 text-xs',
    },
    color: {
      gray: 'bg-gray-800 text-gray-300',
      red: 'bg-red-900/30 text-red-400',
      green: 'bg-green-900/30 text-green-400',
      yellow: 'bg-yellow-900/30 text-yellow-400',
      blue: 'bg-blue-900/30 text-blue-400',
    },
  },
  defaultVariants: {
    color: 'gray',
    size: 'md',
  },
});
</script>

<template>
  <span :class="badge({ color: color || 'gray', size })">
    <slot>{{ label }}</slot>
  </span>
</template>

