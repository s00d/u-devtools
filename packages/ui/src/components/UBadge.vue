<script setup lang="ts">
defineProps<{
  color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue';
  label?: string | number;
  size?: 'xs' | 'sm' | 'md';
}>();
</script>

<template>
  <span
    class="rounded font-medium inline-flex items-center justify-center"
    :class="[
      size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-0.5 text-xs',
      {
        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': !color || color === 'gray',
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': color === 'red',
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': color === 'green',
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': color === 'yellow',
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400': color === 'blue',
      },
    ]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

