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
    xs: 'px-2 py-0.5 text-xs gap-1',
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-1.5 text-sm gap-2',
    lg: 'px-5 py-2 text-base gap-2',
    xl: 'px-6 py-2.5 text-lg gap-2.5',
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

const buttonStyle = computed(() => {
  if (props.variant === 'primary') {
    return {
      backgroundColor: '#6366f1',
      color: 'white',
      boxShadow: '0 4px 12px -2px rgba(79,70,229,0.4)'
    };
  } else if (props.variant === 'secondary') {
    return {
      backgroundColor: 'var(--udt-bg-surface)',
      color: 'var(--udt-text)',
      border: '1px solid var(--udt-border)'
    };
  } else if (props.variant === 'ghost') {
    return {
      color: 'var(--udt-text-dim)',
      backgroundColor: 'transparent'
    };
  } else if (props.variant === 'danger') {
    return {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    };
  } else {
    return {
      border: '1px solid var(--udt-border)',
      backgroundColor: 'var(--udt-bg-surface)',
      color: 'var(--udt-text)'
    };
  }
});

const handleMouseEnter = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  if (props.variant === 'primary') {
    target.style.backgroundColor = '#4f46e5';
    target.style.boxShadow = '0 6px 16px -2px rgba(79,70,229,0.6)';
  } else if (props.variant === 'secondary') {
    target.style.backgroundColor = 'var(--udt-bg-hover)';
  } else if (props.variant === 'ghost') {
    target.style.color = 'var(--udt-text)';
    target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  } else if (props.variant === 'danger') {
    target.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
  } else {
    target.style.backgroundColor = 'var(--udt-bg-hover)';
  }
};

const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  if (props.variant === 'primary') {
    target.style.backgroundColor = '#6366f1';
    target.style.boxShadow = '0 4px 12px -2px rgba(79,70,229,0.4)';
  } else if (props.variant === 'secondary') {
    target.style.backgroundColor = 'var(--udt-bg-surface)';
  } else if (props.variant === 'ghost') {
    target.style.color = 'var(--udt-text-dim)';
    target.style.backgroundColor = 'transparent';
  } else if (props.variant === 'danger') {
    target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
  } else {
    target.style.backgroundColor = 'var(--udt-bg-surface)';
  }
};
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
    ]"
    :style="buttonStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="$emit('click', $event)"
  >
    <!-- Добавляем легкий блик для primary -->
    <div v-if="variant === 'primary'" class="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
    
    <UIcon v-if="loading" name="ArrowPath" :class="[iconSize, 'animate-spin']" />
    <UIcon v-else-if="icon" :name="icon" :class="iconSize" />
    <slot />
  </button>
</template>
