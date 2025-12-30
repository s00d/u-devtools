<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue';
import { useDevToolsState } from './composables/useDevToolsState';
import { useResizable } from './composables/useResizable';
import { devtools } from '@u-devtools/core';
import Launcher from './components/Launcher.vue';

const props = defineProps<{ base: string }>();

const { isOpen, height } = useDevToolsState();

// Resize Logic
const { onPointerDown } = useResizable(
  height,
  () => {
    // onResizeStart
  },
  () => {
    // onResizeEnd
  }
);

// Body padding hack (чтобы контент не перекрывался)
// Сохраняем оригинальное значение для восстановления
const originalPaddingBottom = document.body.style.paddingBottom;

watch(
  [isOpen, height],
  ([open, h]) => {
    if (open) {
      document.body.style.paddingBottom = `${h}px`;
    } else {
      document.body.style.paddingBottom = '0px';
    }
  },
  { immediate: true }
);

// Cleanup при размонтировании
onUnmounted(() => {
  document.body.style.paddingBottom = originalPaddingBottom || '';
});

// Блокировка скролла страницы при наведении на DevTools
let originalOverflow = '';
let originalOverflowY = '';
let isHovering = false;

const blockPageScroll = () => {
  if (isHovering) return;
  isHovering = true;
  originalOverflow = document.body.style.overflow;
  originalOverflowY = document.body.style.overflowY;
  document.body.style.overflow = 'hidden';
  document.body.style.overflowY = 'hidden';
};

const unblockPageScroll = () => {
  if (!isHovering) return;
  isHovering = false;
  document.body.style.overflow = originalOverflow;
  document.body.style.overflowY = originalOverflowY;
};

// Слушаем сообщения от Iframe (например, кнопку закрытия внутри)
onMounted(() => {
  window.addEventListener('message', (e) => {
    if (e.data === 'u-devtools:close' || (e.data && e.data.type === 'u-devtools:close')) {
      // Используем devtools.close() для синхронизации через BroadcastChannel
      devtools.close();
    }
  });
});
</script>

<template>
  <div class="udt-overlay">

    <!-- IFRAME CONTAINER -->
    <div
      class="udt-overlay-container"
      :class="isOpen ? 'visible' : 'hidden'"
      :style="{
        height: `${height}px`,
      }"
      @mouseenter="blockPageScroll"
      @mouseleave="unblockPageScroll"
    >
      <!-- Resizer Handle -->
      <div
        class="udt-resizer-handle"
        @pointerdown="onPointerDown"
      >
        <div class="udt-resizer-line" />
      </div>

      <!-- Overlay to catch mouse events during resize -->
      <div class="udt-resizer-overlay" />

      <iframe
        :src="`${props.base}/index.html`"
        class="udt-overlay-iframe"
      />
    </div>

    <!-- LAUNCHER (Всегда рендерится, сам управляет своей видимостью) -->
    <Launcher />

  </div>
</template>

