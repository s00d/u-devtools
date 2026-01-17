<script setup lang="ts">
import { tv } from 'tailwind-variants';

defineProps<{
  label: string;
  value: string | number;
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}>();

const stat = tv({
  base: 'p-4 border border-zinc-800 rounded',
  variants: {
    color: {
      indigo: 'bg-indigo-900/20 border-indigo-800',
      green: 'bg-green-900/20 border-green-800',
      blue: 'bg-blue-900/20 border-blue-800',
      purple: 'bg-purple-900/20 border-purple-800',
      red: 'bg-red-900/20 border-red-800',
      yellow: 'bg-yellow-900/20 border-yellow-800',
      default: 'bg-gray-800 border-gray-700',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

const statLabel = tv({
  base: 'text-xs uppercase font-bold mb-1',
  variants: {
    color: {
      indigo: 'text-indigo-400',
      green: 'text-green-400',
      blue: 'text-blue-400',
      purple: 'text-purple-400',
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      default: 'text-gray-400',
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

const statValue = tv({
  base: 'font-bold',
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-2xl',
      lg: 'text-3xl',
    },
    color: {
      indigo: 'text-indigo-100',
      green: 'text-green-100',
      blue: 'text-blue-100',
      purple: 'text-purple-100',
      red: 'text-red-100',
      yellow: 'text-yellow-100',
      default: 'text-gray-100',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'default',
  },
});
</script>

<template>
  <div :class="stat({ color: color || 'default' })">
    <div :class="statLabel({ color: color || 'default' })">
      {{ label }}
    </div>
    <div :class="statValue({ size, color: color || 'default' })">
      {{ value }}
    </div>
  </div>
</template>

