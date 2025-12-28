<script setup lang="ts">
defineProps<{
  modelValue?: string | number;
  placeholder?: string;
  type?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    :placeholder="placeholder"
    class="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
