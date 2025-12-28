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
    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
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
