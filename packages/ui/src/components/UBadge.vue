<script setup lang="ts">
defineProps<{
  color?: 'gray' | 'red' | 'green' | 'yellow' | 'blue';
  label?: string | number;
}>();
</script>

<template>
  <span
    class="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center justify-center"
    :class="{
      'bg-gray-100 text-gray-700': !color || color === 'gray',
      'bg-red-100 text-red-700': color === 'red',
      'bg-green-100 text-green-700': color === 'green',
      'bg-yellow-100 text-yellow-800': color === 'yellow',
      'bg-blue-100 text-blue-700': color === 'blue',
    }"
  >
    <slot>{{ label }}</slot>
  </span>
</template>

