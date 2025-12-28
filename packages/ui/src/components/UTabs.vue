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
  <div class="flex border-b border-gray-700">
    <button
      v-for="item in items"
      :key="item"
      @click="$emit('update:modelValue', item)"
      class="px-4 py-2 text-sm font-medium transition-colors border-b-2"
      :class="
        modelValue === item
          ? 'border-indigo-400 text-indigo-400'
          : 'border-transparent text-gray-400 hover:text-gray-300'
      "
    >
      {{ item }}
    </button>
  </div>
</template>

