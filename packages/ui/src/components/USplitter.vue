<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStorage } from '@vueuse/core';
import { useResizable } from '../composables/useResizable';

const props = defineProps<{
  defaultSize?: number;
  min?: number;
  max?: number;
  /**
   * Ключ для сохранения размера в localStorage.
   * Если не указан, размер не сохраняется между сессиями.
   */
  persistenceKey?: string;
  /**
   * Если true, меняет местами left и right слоты визуально.
   * left становится справа, right становится слева.
   */
  reverse?: boolean;
}>();

const container = ref<HTMLElement | null>(null);

// Используем useStorage для автоматического сохранения в localStorage
// Если persistenceKey не указан, используем обычный ref
const leftSize = props.persistenceKey
  ? useStorage(props.persistenceKey, props.defaultSize || 200)
  : ref(props.defaultSize || 200);

// Используем универсальный composable для ресайза
const { onPointerDown } = useResizable(leftSize, {
  direction: 'horizontal',
  min: props.min || 100,
  max: () => {
    if (!container.value) return props.max || Infinity;
    const rect = container.value.getBoundingClientRect();
    return props.max || rect.width - 100;
  },
});

onMounted(() => {
  if (container.value) {
    container.value.style.display = 'flex';
  }
});
</script>

<template>
  <div ref="container" class="flex h-full w-full relative" :class="{ 'flex-row-reverse': reverse }">
    <div :style="{ width: leftSize + 'px', minWidth: props.min + 'px' || '100px' }" class="flex-shrink-0">
      <slot name="left" />
    </div>
    <div
      class="w-1 bg-gray-700 cursor-col-resize hover:bg-indigo-500 transition-colors flex-shrink-0"
      @pointerdown="onPointerDown"
    />
    <div class="flex-1 min-w-0">
      <slot name="right" />
    </div>
  </div>
</template>

