<script setup lang="ts">
defineProps<{
  items: string[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <div class="flex gap-1 border border-gray-700 rounded overflow-hidden bg-gray-800">
    <button
      v-for="item in items"
      :key="item"
      @click="emit('update:modelValue', item)"
      class="px-3 py-1.5 text-sm transition-colors font-medium"
      :class="
        modelValue === item
          ? 'bg-indigo-900/30 text-indigo-300'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      "
    >
      {{ item }}
    </button>
  </div>
</template>

