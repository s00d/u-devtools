<script setup lang="ts">
import { tv } from 'tailwind-variants';

interface Option {
  label: string;
  value: string;
}

withDefaults(
  defineProps<{
    modelValue?: string;
    options?: Option[];
    placeholder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
  }>(),
  {
    size: 'md',
    disabled: false,
  }
);

defineEmits<{
  'update:modelValue': [value: string];
  change: [event: Event];
}>();

const select = tv({
  base: 'w-full border border-gray-600 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-gray-800 text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    size: {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-5 py-2.5 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
</script>

<template>
  <select
    :class="select({ size })"
    :value="modelValue"
    :disabled="disabled"
    @change="
      $emit('update:modelValue', ($event.target as HTMLSelectElement).value);
      $emit('change', $event);
    "
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
