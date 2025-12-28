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
        'bg-gray-800 text-gray-300': !color || color === 'gray',
        'bg-red-900/30 text-red-400': color === 'red',
        'bg-green-900/30 text-green-400': color === 'green',
        'bg-yellow-900/30 text-yellow-400': color === 'yellow',
        'bg-blue-900/30 text-blue-400': color === 'blue',
      },
    ]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

