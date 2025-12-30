<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useDevToolsState } from '../composables/useDevToolsState';
import { useOverlayMenu } from '../composables/useOverlayMenu';
import { UIcon } from '@u-devtools/ui';
import { AppBridge, devtools, type OverlayContext, type OverlayMenuItem } from '@u-devtools/core';

const { isOpen } = useDevToolsState();
const { items: menuItems } = useOverlayMenu();

const isMenuOpen = ref(false);
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
  if (isMenuOpen.value) return; // Не прятать, если открыто меню
  
  // Прячем через 1.5 секунды бездействия
  hideTimeout = setTimeout(() => {
    isHovered.value = false;
  }, 1500);
};

// Скрываем меню при закрытии
watch(isHovered, (val) => {
  if (!val) isMenuOpen.value = false;
});

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

const toggleMenu = () => {
  if (menuItems.value.length === 0) {
    // Используем devtools для синхронизации через BroadcastChannel
    if (isOpen.value) devtools.close(); else devtools.open();
  } else {
    isMenuOpen.value = !isMenuOpen.value;
  }
};

const createContext = (): OverlayContext => ({
  open: () => devtools.open(),
  close: () => devtools.close(),
  toggle: () => devtools.toggle(),
  isOpen: isOpen.value,
  createBridge: (namespace: string) => new AppBridge(namespace)
});

const handleItemClick = (item: OverlayMenuItem) => {
  item.onClick(createContext());
  isMenuOpen.value = false;
};

const toggleMain = () => {
  // Используем devtools для синхронизации через BroadcastChannel
  if (isOpen.value) devtools.close(); else devtools.open();
  isMenuOpen.value = false;
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
    class="fixed bottom-8 right-0 z-[2147483646] font-sans flex items-center"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- 
      MENU LIST (Popup) 
      Появляется слева от кнопки
    -->
    <Transition name="fade-slide">
      <div 
        v-if="isMenuOpen"
        class="absolute bottom-full right-0 mb-3 mr-2 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-48 origin-bottom-right"
      >
        <div class="py-1">
          <!-- Main Toggle -->
          <button 
            @click="toggleMain"
            class="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-800"
          >
            <div class="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded text-indigo-600 dark:text-indigo-400">
              <UIcon name="WrenchScrewdriver" class="w-4 h-4" />
            </div>
            {{ isOpen ? 'Close DevTools' : 'Open DevTools' }}
          </button>

          <!-- Dynamic Items -->
          <button
            v-for="item in menuItems"
            :key="item.id"
            @click="handleItemClick(item)"
            class="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
          >
            <UIcon :name="item.icon" class="w-4 h-4 opacity-70" />
            {{ item.label }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- 
      MAIN BUTTON (Docked Tab) 
      Сдвигается вправо (translateX), оставляя 8px видимыми
    -->
    <div
      class="transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex items-center"
      :class="[
        // Если открыт iframe - прячем кнопку полностью (или оставляем, на ваш выбор)
        isOpen ? 'translate-x-[120%]' : '',
        // Если наведен - показываем полностью (translate-0)
        // Если нет - прячем, оставляя 10px (translate-x-[calc(100%-10px)])
        !isOpen && isHovered ? 'translate-x-0 opacity-100' : '',
        !isOpen && !isHovered ? 'translate-x-[calc(100%-10px)] opacity-60 grayscale' : ''
      ]"
    >
      <!-- Левая часть кнопки (скругленная) -->
      <button 
        @click="toggleMenu"
        class="bg-[#18181b] text-white h-10 pl-3 pr-4 rounded-l-lg shadow-lg cursor-pointer flex items-center gap-2 hover:bg-black transition-colors border-y border-l border-[#333] relative"
      >
        <UIcon 
          name="WrenchScrewdriver" 
          class="w-5 h-5 transition-transform duration-300" 
          :class="isMenuOpen ? 'rotate-90' : ''"
        />
        <span 
          class="font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
          :class="isHovered ? 'max-w-[100px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'"
        >
          DevTools
        </span>
        
        <!-- Notification Dot -->
        <span v-if="menuItems.length > 0" class="absolute top-2 right-2 flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
        </span>
      </button>
    </div>

  </div>
</template>

<style scoped>
@reference "tailwindcss";

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.95);
}
</style>

