<script setup lang="ts">
import { tv } from 'tailwind-variants';
import type { ColorOption } from '../types';

defineProps<{
  colors: ColorOption[];
  currentColor?: string | null;
  onSelect: (value: string) => void;
}>();

const colorButton = tv({
  base: 'aspect-square rounded border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500',
  variants: {
    selected: {
      true: 'ring-2 ring-indigo-500 border-indigo-400',
      false: 'border-zinc-700 hover:border-zinc-600',
    },
  },
  defaultVariants: {
    selected: false,
  },
});
</script>

<template>
  <div class="p-2 max-h-80 overflow-y-auto">
    <div v-if="colors.length > 0" class="grid grid-cols-6 gap-1.5">
      <template v-for="option in colors" :key="option.value">
        <slot
          name="item"
          :option="option"
          :selected="currentColor === option.value"
          :on-click="() => onSelect(option.value)"
        >
          <!-- Default button if no slot provided -->
          <button
            type="button"
            :class="colorButton({ selected: currentColor === option.value })"
            :title="option.name"
            @click="onSelect(option.value)"
          />
        </slot>
      </template>
    </div>
    <div v-else class="px-3 py-2 text-sm text-zinc-500 text-center">
      No colors available
    </div>
  </div>
</template>
