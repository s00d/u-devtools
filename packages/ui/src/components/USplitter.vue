<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  defaultSize?: number;
  min?: number;
  max?: number;
}>();

const container = ref<HTMLElement | null>(null);
const leftSize = ref(props.defaultSize || 200);
const isDragging = ref(false);

const startDrag = (e: MouseEvent) => {
  if (e.button !== 0) return;
  isDragging.value = true;
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
  e.preventDefault();
};

const onDrag = (e: MouseEvent) => {
  if (!container.value || !isDragging.value) return;
  const rect = container.value.getBoundingClientRect();
  const newSize = e.clientX - rect.left;
  const min = props.min || 100;
  const max = props.max || rect.width - 100;
  leftSize.value = Math.max(min, Math.min(max, newSize));
};

const stopDrag = () => {
  isDragging.value = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);
};

onMounted(() => {
  if (container.value) {
    container.value.style.display = 'flex';
  }
});

onUnmounted(() => {
  stopDrag();
});
</script>

<template>
  <div ref="container" class="flex h-full w-full relative">
    <div :style="{ width: leftSize + 'px', minWidth: props.min + 'px' || '100px' }" class="flex-shrink-0">
      <slot name="left" />
    </div>
    <div
      class="w-1 bg-gray-700 cursor-col-resize hover:bg-indigo-500 transition-colors flex-shrink-0"
      @mousedown="startDrag"
    />
    <div class="flex-1 min-w-0">
      <slot name="right" />
    </div>
  </div>
</template>

