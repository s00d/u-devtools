<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';

defineProps<{
  active?: boolean;
  icon?: string;
  label?: string;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<template>
  <button
    @click="$emit('click', $event)"
    :class="[
      'px-2 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1',
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-gray-800 text-gray-200 hover:bg-gray-700',
    ]"
  >
    <UIcon v-if="icon" :name="icon" class="w-4 h-4" />
    <span v-if="label">{{ label }}</span>
    <slot />
  </button>
</template>

