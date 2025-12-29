<script setup lang="ts">
import { computed } from 'vue';
import UIcon from './UIcon.vue';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: string;
  loading?: boolean;
}>(), {
  size: 'md',
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-1.5 py-0.5 text-xs gap-1',
    sm: 'px-2 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
    lg: 'px-4 py-2 text-base gap-2',
    xl: 'px-5 py-2.5 text-lg gap-2.5',
  };
  return sizes[props.size];
});

const iconSize = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };
  return sizes[props.size];
});
</script>

<template>
  <button
    class="flex items-center justify-center transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      sizeClasses,
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
    <UIcon v-if="loading" name="ArrowPath" :class="[iconSize, 'animate-spin']" />
    <UIcon v-else-if="icon" :name="icon" :class="iconSize" />
    <slot />
  </button>
</template>
