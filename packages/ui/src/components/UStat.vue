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
        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
        : color === 'green'
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : color === 'blue'
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            : color === 'purple'
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
              : color === 'red'
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : color === 'yellow'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    ]"
  >
    <div
      :class="[
        'text-xs uppercase font-bold mb-1',
        color === 'indigo'
          ? 'text-indigo-500 dark:text-indigo-400'
          : color === 'green'
            ? 'text-green-500 dark:text-green-400'
            : color === 'blue'
              ? 'text-blue-500 dark:text-blue-400'
              : color === 'purple'
                ? 'text-purple-500 dark:text-purple-400'
                : color === 'red'
                  ? 'text-red-500 dark:text-red-400'
                  : color === 'yellow'
                    ? 'text-yellow-500 dark:text-yellow-400'
                    : 'text-gray-500 dark:text-gray-400',
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
          ? 'text-indigo-900 dark:text-indigo-100'
          : color === 'green'
            ? 'text-green-900 dark:text-green-100'
            : color === 'blue'
              ? 'text-blue-900 dark:text-blue-100'
              : color === 'purple'
                ? 'text-purple-900 dark:text-purple-100'
                : color === 'red'
                  ? 'text-red-900 dark:text-red-100'
                  : color === 'yellow'
                    ? 'text-yellow-900 dark:text-yellow-100'
                    : 'text-gray-900 dark:text-gray-100',
      ]"
    >
      {{ value }}
    </div>
  </div>
</template>

