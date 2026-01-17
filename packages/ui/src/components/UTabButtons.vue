<script setup lang="ts">
import { tv } from 'tailwind-variants';

defineProps<{
  items: string[];
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const tabButton = tv({
  base: 'px-3 py-1.5 text-sm transition-colors font-medium',
  variants: {
    active: {
      true: 'bg-indigo-900/30 text-indigo-300',
      false: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
    },
  },
  defaultVariants: {
    active: false,
  },
});
</script>

<template>
  <div class="flex gap-1 border border-gray-700 rounded overflow-hidden bg-gray-800">
    <button
      v-for="item in items"
      :key="item"
      @click="emit('update:modelValue', item)"
      :class="tabButton({ active: modelValue === item })"
    >
      {{ item }}
    </button>
  </div>
</template>

