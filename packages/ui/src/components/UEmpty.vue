<script setup lang="ts">
import UIcon from './UIcon.vue';

defineProps<{
  icon?: string;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}>();
</script>

<template>
  <div
    :class="[
      'flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 gap-4',
      size === 'sm' ? 'py-8' : size === 'lg' ? 'py-16' : 'py-12',
    ]"
  >
    <div
      v-if="icon"
      :class="[
        'opacity-30',
        size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20',
      ]"
    >
      <UIcon :name="icon" :size="size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20'" />
    </div>
    <div v-else class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-30">
      <UIcon name="MagnifyingGlass" :size="size === 'sm' ? 'w-8 h-8' : 'w-12 h-12'" />
    </div>
    <div class="text-center">
      <p v-if="title" class="font-semibold text-gray-500 dark:text-gray-400 mb-1">{{ title }}</p>
      <p v-if="description" class="text-sm text-gray-400 dark:text-gray-500">{{ description }}</p>
    </div>
  </div>
</template>

