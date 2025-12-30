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
  <div class="udt-overlay font-sans text-gray-800">

    <!-- IFRAME CONTAINER -->
    <div
      class="fixed bottom-0 left-0 w-full bg-white dark:bg-[#0f172a] shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 ease-in-out"
      :style="{
        height: `${height}px`,
        zIndex: 2147483647,
        transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
        visibility: isOpen ? 'visible' : 'hidden',
        isolation: 'isolate'
      }"
      @mouseenter="blockPageScroll"
      @mouseleave="unblockPageScroll"
    >
      <!-- Resizer Handle -->
      <div
        class="absolute -top-1.5 left-0 w-full h-3 cursor-row-resize z-50 group flex items-center justify-center"
        @pointerdown="onPointerDown"
      >
        <div
          class="w-full h-[1px] bg-gray-200 dark:bg-gray-700 transition-all group-hover:bg-indigo-500 group-hover:h-[2px]"
        />
      </div>

      <!-- Overlay to catch mouse events during resize -->
      <div
        class="absolute inset-0 z-50 bg-transparent pointer-events-none"
      />

      <iframe
        :src="`${props.base}/index.html`"
        class="w-full h-full border-none bg-white dark:bg-[#0f172a]"
      />
    </div>

    <!-- LAUNCHER (Всегда рендерится, сам управляет своей видимостью) -->
    <Launcher />

  </div>
</template>

