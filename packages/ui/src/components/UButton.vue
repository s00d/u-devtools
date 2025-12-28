<script setup lang="ts">
import UIcon from './UIcon.vue';

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
        ? 'bg-indigo-500 text-white hover:bg-indigo-600'
        : variant === 'ghost'
          ? 'bg-transparent text-gray-300 hover:bg-gray-800'
          : variant === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'border border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600',
    ]"
    @click="$emit('click', $event)"
  >
    <UIcon v-if="loading" name="ArrowPath" class="animate-spin" />
    <UIcon v-else-if="icon" :name="icon" class="mr-2" />
    <slot />
  </button>
</template>
