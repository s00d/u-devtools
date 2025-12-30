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
    class="udt-launcher"
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
      class="udt-menu-items"
      :class="[
        // Если открыт iframe - прячем кнопки полностью
        isOpen ? 'hidden' : '',
        // Если наведен - показываем полностью
        // Если нет - прячем полностью
        !isOpen && isHovered ? 'visible' : '',
        !isOpen && !isHovered ? 'hidden' : ''
      ]"
    >
      <button
        v-for="item in menuItems"
        :key="item.id"
        :title="item.label"
        class="udt-menu-item"
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
          class="udt-menu-item-icon"
        />
        <!-- URL иконки -->
        <img
          v-else-if="item.iconUrl"
          :src="item.iconUrl"
          :alt="item.label"
          class="udt-menu-item-icon"
        />
        <!-- Имя иконки Heroicons (обратная совместимость) -->
        <UIcon v-else-if="item.icon" :name="item.icon" class="udt-menu-item-icon" />
      </button>
    </div>

    <!-- Основная кнопка DevTools -->
    <div
      class="udt-main-button-container"
      :class="[
        // Если открыт iframe - прячем кнопку полностью
        isOpen ? 'hidden' : '',
        // Если наведен - показываем полностью
        // Если нет - прячем, оставляя 10px
        !isOpen && isHovered ? 'visible' : '',
        !isOpen && !isHovered ? 'collapsed' : ''
      ]"
    >
      <button
        @click="toggleMain"
        class="udt-main-button"
      >
        <UIcon
          name="WrenchScrewdriver"
          class="udt-main-button-icon"
        />
        <span
          class="udt-main-button-text"
          :class="isHovered ? 'visible' : 'hidden'"
        >
          DevTools
        </span>
      </button>
    </div>

  </div>
</template>

