<script setup lang="ts">
interface Option {
  label: string;
  value: string;
}

defineProps<{
  modelValue?: string;
  options?: Option[];
  placeholder?: string;
  size?: 'sm' | 'md';
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <select
    class="w-full px-3 py-1.5 text-sm border border-gray-600 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 bg-gray-800 text-gray-200"
    :class="size === 'sm' ? 'text-xs py-1' : ''"
    :value="modelValue"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option v-if="placeholder" value="">{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>
