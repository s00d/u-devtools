<script setup lang="ts">
import { tv } from 'tailwind-variants';

defineProps<{
  title?: string;
  subtitle?: string;
  padding?: boolean;
  hover?: boolean;
}>();

const card = tv({
  base: 'rounded-xl overflow-hidden shadow-sm transition-colors duration-300 border border-zinc-800 bg-zinc-800 mb-6',
  variants: {
    hover: {
      true: 'hover:border-indigo-500/30',
      false: '',
    },
  },
  defaultVariants: {
    hover: false,
  },
});

const cardContent = tv({
  base: '',
  variants: {
    padding: {
      true: 'p-5',
      false: '',
    },
  },
  defaultVariants: {
    padding: true,
  },
});
</script>

<template>
  <div :class="card({ hover: hover || false })">
    <div 
      v-if="title || subtitle" 
      class="px-5 py-4 border-b border-zinc-800"
    >
      <h3 v-if="title" class="font-semibold text-base tracking-tight text-gray-200">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs mt-0.5 text-gray-400">{{ subtitle }}</p>
    </div>
    <div :class="cardContent({ padding: padding !== false })">
      <slot />
    </div>
  </div>
</template>

