<script setup lang="ts">
defineProps<{
  items: string[];
  modelValue?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="flex border-b border-gray-200 dark:border-gray-700">
    <button
      v-for="item in items"
      :key="item"
      @click="$emit('update:modelValue', item)"
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
      :class="
        modelValue === item
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
      "
    >
      {{ item }}
    </button>
  </div>
</template>

