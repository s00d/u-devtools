<script setup lang="ts">
defineProps<{
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>();

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    :class="[
      'px-4 py-2 rounded font-medium transition-colors',
      {
        'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
        'bg-gray-600 text-white hover:bg-gray-700': variant === 'secondary',
        'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        'opacity-50 cursor-not-allowed': disabled,
        'text-sm px-3 py-1.5': size === 'sm',
        'text-lg px-6 py-3': size === 'lg',
      }
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

