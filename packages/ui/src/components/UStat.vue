<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  color?: 'indigo' | 'green' | 'blue' | 'purple' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <div
    :class="[
      'p-4 border border-udt-c-border rounded',
      color === 'indigo'
        ? 'bg-indigo-900/20 border-indigo-800'
        : color === 'green'
          ? 'bg-green-900/20 border-green-800'
          : color === 'blue'
            ? 'bg-blue-900/20 border-blue-800'
            : color === 'purple'
              ? 'bg-purple-900/20 border-purple-800'
              : color === 'red'
                ? 'bg-red-900/20 border-red-800'
                : color === 'yellow'
                  ? 'bg-yellow-900/20 border-yellow-800'
                  : 'bg-gray-800 border-gray-700',
    ]"
  >
    <div
      :class="[
        'text-xs uppercase font-bold mb-1',
        color === 'indigo'
          ? 'text-indigo-400'
          : color === 'green'
            ? 'text-green-400'
            : color === 'blue'
              ? 'text-blue-400'
              : color === 'purple'
                ? 'text-purple-400'
                : color === 'red'
                  ? 'text-red-400'
                  : color === 'yellow'
                    ? 'text-yellow-400'
                    : 'text-gray-400',
      ]"
    >
      {{ label }}
    </div>
    <div
      :class="[
        'font-bold',
        size === 'sm'
          ? 'text-lg'
          : size === 'lg'
            ? 'text-3xl'
            : 'text-2xl',
        color === 'indigo'
          ? 'text-indigo-100'
          : color === 'green'
            ? 'text-green-100'
            : color === 'blue'
              ? 'text-blue-100'
              : color === 'purple'
                ? 'text-purple-100'
                : color === 'red'
                  ? 'text-red-100'
                  : color === 'yellow'
                    ? 'text-yellow-100'
                    : 'text-gray-100',
      ]"
    >
      {{ value }}
    </div>
  </div>
</template>

