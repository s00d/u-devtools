<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useDevToolsState } from '../../composables/useDevToolsState';
import { UIcon } from '@u-devtools/ui';

const { 
  plugins, 
  activePluginId, 
  isSidebarExpanded, 
  isManagerActive, 
  showSettings, 
  closeDevTools 
} = useDevToolsState();

// Состояние меню настроек
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Закрываем меню при клике снаружи
onClickOutside(menuRef, () => {
  isMenuOpen.value = false;
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMenuItemClick = (action: 'settings' | 'about') => {
  isMenuOpen.value = false;
  if (action === 'settings') showSettings.value = true;
  if (action === 'about') activePluginId.value = 'internal:about';
};
</script>

<template>
  <div
    class="flex-none bg-[#18181b] border-r border-[#27272a] z-10 flex flex-col transition-all duration-300 ease-in-out select-none"
    :class="isSidebarExpanded ? 'w-64' : 'w-12'"
  >
    <!-- 1. Top: Toggle Sidebar -->
    <div 
      class="h-12 flex items-center border-b border-[#27272a] hover:bg-[#27272a] cursor-pointer transition-colors"
      :class="isSidebarExpanded ? 'px-4 justify-between' : 'justify-center'"
      @click="isSidebarExpanded = !isSidebarExpanded"
      title="Toggle Sidebar"
    >
      <div v-if="isSidebarExpanded" class="font-bold text-gray-200 text-sm tracking-wide">DEVTOOLS</div>
      <UIcon 
        :name="isSidebarExpanded ? 'ChevronDoubleLeft' : 'Bars3'" 
        class="w-5 h-5 text-gray-400" 
      />
    </div>

    <!-- 2. Middle: Plugins List -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden py-2 space-y-0.5 scrollbar-hide">
      <button
        v-for="p in plugins"
        :key="p.name"
        @click="activePluginId = p.name"
        class="w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 relative group border-l-2"
        :class="[
          activePluginId === p.name
            ? 'border-indigo-500 text-white bg-gray-800'
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800',
          !isSidebarExpanded ? 'justify-center' : ''
        ]"
      >
        <UIcon :name="p.icon" class="w-5 h-5 flex-shrink-0" />
        
        <span 
          v-if="isSidebarExpanded" 
          class="text-sm font-medium truncate"
        >
          {{ p.name }}
        </span>

        <!-- Tooltip (Visible only when collapsed) -->
        <div 
          v-if="!isSidebarExpanded"
          class="absolute left-10 px-2 py-1 bg-[#27272a] text-white text-xs rounded shadow-xl border border-[#3f3f46] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 ml-2"
        >
          {{ p.name }}
        </div>
      </button>
    </div>

    <!-- 3. Bottom: Compact Actions -->
    <div class="mt-auto flex flex-col py-2 border-t border-[#27272a] space-y-1 relative">
      
      <!-- Plugin Manager -->
      <button 
        @click="activePluginId = 'internal:plugins'" 
        class="w-full flex items-center gap-3 px-3 py-2.5 transition-colors group relative border-l-2" 
        :class="[
          isManagerActive ? 'border-indigo-500 text-white bg-gray-800' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800',
          !isSidebarExpanded ? 'justify-center' : ''
        ]"
        title="Extensions"
      >
        <UIcon name="Squares2X2" class="w-5 h-5 flex-shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">Extensions</span>
      </button>

      <!-- Settings (With Popover Menu) -->
      <div ref="menuRef" class="relative w-full">
        <button 
          @click="toggleMenu" 
          class="w-full flex items-center gap-3 px-3 py-2.5 transition-colors group relative border-l-2 border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800"
          :class="[isMenuOpen ? 'text-gray-200' : '', !isSidebarExpanded ? 'justify-center' : '']"
          title="Manage"
        >
          <UIcon name="Cog6Tooth" class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarExpanded" class="text-sm">Manage</span>
        </button>

        <!-- Popover Menu -->
        <div 
          v-if="isMenuOpen"
          class="absolute bottom-full mb-2 bg-[#27272a] border border-[#3f3f46] rounded-lg shadow-2xl overflow-hidden min-w-[180px] z-50 flex flex-col py-1"
          :class="isSidebarExpanded ? 'left-2' : 'left-full ml-2'"
        >
          <button 
            @click="handleMenuItemClick('settings')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left w-full"
          >
            <UIcon name="AdjustmentsHorizontal" class="w-4 h-4" /> Settings
          </button>
          
          <div class="h-px bg-[#3f3f46] my-1 mx-2"></div>
          
          <button 
            @click="handleMenuItemClick('about')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white text-left w-full"
          >
            <UIcon name="InformationCircle" class="w-4 h-4" /> About
          </button>
        </div>
      </div>
      
      <!-- Close Button (Always visible, distinct) -->
      <button 
        @click="closeDevTools" 
        class="w-full flex items-center gap-3 px-3 py-2.5 transition-colors group relative border-l-2 border-transparent text-gray-500 hover:text-red-400 hover:bg-red-500/10"
        :class="!isSidebarExpanded ? 'justify-center' : ''"
        title="Close DevTools"
      >
        <UIcon name="XMark" class="w-5 h-5 flex-shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">Close</span>
      </button>

    </div>
  </div>
</template>

<style scoped>
/* Скрытие скроллбара */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
