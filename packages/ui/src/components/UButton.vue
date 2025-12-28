<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  icon?: string;
  loading?: boolean;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    class="flex items-center justify-center gap-2 transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      variant === 'primary'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
        : variant === 'ghost'
          ? 'bg-transparent text-gray-600 hover:bg-gray-100'
          : variant === 'danger'
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ]"
    @click="$emit('click', $event)"
  >
    <div v-if="loading" class="i-carbon-circle-dash animate-spin" />
    <div v-else-if="icon" :class="icon" />
    <slot />
  </button>
</template>
