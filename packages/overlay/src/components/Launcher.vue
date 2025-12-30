<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useDevToolsState } from '../composables/useDevToolsState';
import { useOverlayMenu } from '../composables/useOverlayMenu';
import { UIcon } from '@u-devtools/ui';
import { AppBridge, devtools, type OverlayContext, type OverlayMenuItem } from '@u-devtools/core';

const { isOpen } = useDevToolsState();
const { items: menuItems } = useOverlayMenu();

const isHovered = ref(false);
let hideTimeout: ReturnType<typeof setTimeout> | undefined;

// --- Логика Анимации ---

const onMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = undefined;
  }
  isHovered.value = true;
};

const onMouseLeave = () => {
  // Прячем через 1.5 секунды бездействия
  hideTimeout = setTimeout(() => {
    isHovered.value = false;
  }, 1500);
};

// Показываем кнопку при закрытии DevTools
watch(isOpen, (val) => {
  if (!val) {
    // Когда DevTools закрывается, показываем кнопку на 2 секунды
    isHovered.value = true;
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = undefined;
    }
    hideTimeout = setTimeout(() => {
      isHovered.value = false;
    }, 2000);
  }
});

// --- Действия ---

const toggleMain = () => {
  // Используем devtools для синхронизации через BroadcastChannel
  if (isOpen.value) devtools.close();
  else devtools.open();
};

const createContext = (): OverlayContext => ({
  open: () => devtools.open(),
  close: () => devtools.close(),
  toggle: () => devtools.toggle(),
  isOpen: isOpen.value,
  switchPlugin: (pluginName: string) => devtools.switchPlugin(pluginName),
  switchTab: (pluginName: string, tabName: string) => devtools.switchTab(pluginName, tabName),
  createBridge: (namespace: string) => new AppBridge(namespace),
});

const handleItemClick = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onClick) {
    item.onClick(createContext(), event);
  }
};

const handleItemDoubleClick = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onDoubleClick) {
    item.onDoubleClick(createContext(), event);
  }
};

const handleItemContextMenu = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onContextMenu) {
    event.preventDefault();
    item.onContextMenu(createContext(), event);
  }
};

const handleItemMouseEnter = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onMouseEnter) {
    item.onMouseEnter(createContext(), event);
  }
};

const handleItemMouseLeave = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onMouseLeave) {
    item.onMouseLeave(createContext(), event);
  }
};

const handleItemMouseDown = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onMouseDown) {
    item.onMouseDown(createContext(), event);
  }
};

const handleItemMouseUp = (item: OverlayMenuItem, event: MouseEvent) => {
  if (item.onMouseUp) {
    item.onMouseUp(createContext(), event);
  }
};

const handleItemKeyDown = (item: OverlayMenuItem, event: KeyboardEvent) => {
  if (item.onKeyDown) {
    item.onKeyDown(createContext(), event);
  }
};

const handleItemKeyUp = (item: OverlayMenuItem, event: KeyboardEvent) => {
  if (item.onKeyUp) {
    item.onKeyUp(createContext(), event);
  }
};

const handleItemFocus = (item: OverlayMenuItem, event: FocusEvent) => {
  if (item.onFocus) {
    item.onFocus(createContext(), event);
  }
};

const handleItemBlur = (item: OverlayMenuItem, event: FocusEvent) => {
  if (item.onBlur) {
    item.onBlur(createContext(), event);
  }
};

// Анимация появления при загрузке
onMounted(() => {
  // Сначала показываем кнопку, потом прячем
  isHovered.value = true;
  setTimeout(() => {
    isHovered.value = false;
  }, 2000);
});
</script>

<template>
  <div
    class="fixed bottom-8 right-0 z-[2147483646] font-sans flex items-center gap-1"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!--
      BUTTONS PANEL
      Все кнопки на панели
    -->
    <!-- Дополнительные кнопки из плагинов -->
    <div
      v-if="menuItems.length > 0"
      class="transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center gap-1"
      :class="[
        // Если открыт iframe - прячем кнопки полностью
        isOpen ? 'translate-x-[120%] opacity-0 pointer-events-none' : '',
        // Если наведен - показываем полностью
        // Если нет - прячем полностью
        !isOpen && isHovered ? 'translate-x-0 opacity-100' : '',
        !isOpen && !isHovered ? 'translate-x-[120%] opacity-0 pointer-events-none' : ''
      ]"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        :title="item.label"
        class="bg-zinc-900 text-white h-10 w-10 flex items-center justify-center shadow-lg cursor-pointer hover:bg-black transition-colors border border-zinc-700 rounded-lg relative"
        @click="handleItemClick(item, $event)"
        @dblclick="handleItemDoubleClick(item, $event)"
        @contextmenu="handleItemContextMenu(item, $event)"
        @mouseenter="handleItemMouseEnter(item, $event)"
        @mouseleave="handleItemMouseLeave(item, $event)"
        @mousedown="handleItemMouseDown(item, $event)"
        @mouseup="handleItemMouseUp(item, $event)"
        @keydown="handleItemKeyDown(item, $event)"
        @keyup="handleItemKeyUp(item, $event)"
        @focus="handleItemFocus(item, $event)"
        @blur="handleItemBlur(item, $event)"
      >
        <!-- SVG как текст -->
        <span
          v-if="item.iconSvg"
          v-html="item.iconSvg"
          class="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-current"
        />
        <!-- URL иконки -->
        <img
          v-else-if="item.iconUrl"
          :src="item.iconUrl"
          :alt="item.label"
          class="w-5 h-5 object-contain"
        />
        <!-- Имя иконки Heroicons (обратная совместимость) -->
        <UIcon v-else-if="item.icon" :name="item.icon" class="w-5 h-5" />
      </button>
    </div>

    <!-- Основная кнопка DevTools -->
    <div
      class="transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center"
      :class="[
        // Если открыт iframe - прячем кнопку полностью
        isOpen ? 'translate-x-[120%]' : '',
        // Если наведен - показываем полностью
        // Если нет - прячем, оставляя 10px
        !isOpen && isHovered ? 'translate-x-0 opacity-100' : '',
        !isOpen && !isHovered ? 'translate-x-[calc(100%-10px)] opacity-60 grayscale' : ''
      ]"
    >
      <button
        @click="toggleMain"
        class="bg-zinc-900 text-white h-10 pl-3 pr-4 rounded-l-lg shadow-lg cursor-pointer flex items-center gap-2 hover:bg-black transition-colors border-y border-l border-zinc-700 relative"
      >
        <UIcon
          name="WrenchScrewdriver"
          class="w-5 h-5"
        />
        <span
          class="font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
          :class="isHovered ? 'max-w-[100px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'"
        >
          DevTools
        </span>
      </button>
    </div>

  </div>
</template>

