<script setup lang="ts">
import { computed } from 'vue';
import UIcon from './UIcon.vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    icon?: string;
    loading?: boolean;
  }>(),
  {
    size: 'md',
  }
);

defineEmits<{
  click: [event: MouseEvent];
}>();

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

const variantClasses = computed(() => {
  if (props.variant === 'primary') {
    return 'bg-indigo-600 text-white shadow-[0_4px_12px_-2px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:shadow-[0_6px_16px_-2px_rgba(79,70,229,0.6)]';
  } else if (props.variant === 'secondary') {
    return 'bg-zinc-800 text-gray-200 border border-zinc-800 hover:bg-zinc-700';
  } else if (props.variant === 'ghost') {
    return 'text-gray-400 bg-transparent hover:text-gray-200 hover:bg-white/5';
  } else if (props.variant === 'danger') {
    return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
  } else {
    return 'border border-zinc-800 bg-zinc-800 text-gray-200 hover:bg-zinc-700';
  }
});
</script>

<template>
  <button
    class="relative flex items-center justify-center transition-all duration-200 font-medium select-none overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      // Размеры
      size === 'xs' ? 'px-2 py-1 text-[10px] gap-1 rounded-md' :
      size === 'sm' ? 'px-3 py-1.5 text-xs gap-1.5 rounded-md' :
      size === 'md' ? 'px-4 py-2 text-sm gap-2 rounded-lg' :
      size === 'lg' ? 'px-5 py-2.5 text-base gap-2.5 rounded-xl' :
      'px-6 py-3 text-lg gap-3 rounded-xl',
      variantClasses,
    ]"
    @click="$emit('click', $event)"
  >
    <!-- Добавляем легкий блик для primary -->
    <div v-if="variant === 'primary'" class="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
    
    <UIcon v-if="loading" name="ArrowPath" :class="[iconSize, 'animate-spin']" />
    <UIcon v-else-if="icon" :name="icon" :class="iconSize" />
    <slot />
  </button>
</template>
