<script setup lang="ts">
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { useDevToolsState } from '../../composables/useDevToolsState';
import { createApiForPlugin } from '../../modules/clientApi';
import type { GeneralMenuItem } from '@u-devtools/core';
import { UIcon } from '@u-devtools/ui';

const router = useRouter();
const route = useRoute();
const { plugins, isSidebarExpanded, showSettings, closeDevTools } = useDevToolsState();

// Settings menu state
const isMenuOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// Close menu on outside click
onClickOutside(menuRef, () => {
  isMenuOpen.value = false;
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMenuItemClick = (action: 'settings' | 'about' | 'extensions') => {
  isMenuOpen.value = false;
  if (action === 'settings') showSettings.value = true;
  if (action === 'about') router.push('/about');
  if (action === 'extensions') router.push('/plugins/Plugins');
};

// Calculate list of custom menu items from all plugins
const customMenuItems = computed(() => {
  return plugins.value.flatMap((plugin) => {
    if (!plugin.generalMenuItems) return [];
    return plugin.generalMenuItems.map((item) => ({
      ...item,
      pluginName: plugin.name, // Save plugin name for API context
    }));
  });
});

// Функция запуска действия плагина
const handleCustomItemClick = (item: GeneralMenuItem & { pluginName: string }) => {
  isMenuOpen.value = false;
  // Create API specifically for this plugin so it has access to its storage etc.
  const api = createApiForPlugin(item.pluginName);
  try {
    item.action(api);
  } catch (e) {
    console.error(`Error in general menu action for ${item.pluginName}:`, e);
    api.notify('Action failed', 'error');
  }
};
</script>

<template>
  <div class="relative flex">
    <div
      class="flex-none z-10 flex flex-col transition-all duration-300 ease-in-out select-none border-r border-zinc-800 bg-zinc-800"
      :class="isSidebarExpanded ? 'w-64' : 'w-14'"
    >
      <!-- 1. Header (Logo area) -->
      <div 
        class="h-12 flex items-center border-b border-zinc-800 relative"
        :class="isSidebarExpanded ? 'px-4' : 'justify-center'"
      >
        <!-- Logo with gradient -->
        <div v-if="!isSidebarExpanded" class="w-8 h-8 rounded bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 flex items-center justify-center shadow-sm">
          <UIcon name="WrenchScrewdriver" class="w-4 h-4 text-indigo-400" />
        </div>

        <div v-if="isSidebarExpanded" class="font-bold text-sm tracking-wide opacity-80 flex-1 text-gray-200">U-DEVTOOLS</div>
        
        <!-- Close Button (Subtle) -->
        <button
          @click="closeDevTools"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 hover:text-red-400 transition-colors text-gray-400"
          v-if="isSidebarExpanded"
        >
          <UIcon name="XMark" class="w-4 h-4" />
        </button>
      </div>

    <!-- 2. Plugins List -->
    <div class="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-hide">
      <template v-for="p in plugins" :key="p.name">
        <router-link
          v-if="!p.hideFromMenu"
          :to="{ name: 'plugin', params: { pluginName: p.name } }"
          class="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 group relative border"
          :class="[
            route.params.pluginName === p.name
              ? 'shadow-sm bg-zinc-800 text-indigo-400 border-white/5'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50',
            !isSidebarExpanded ? 'justify-center' : ''
          ]"
        >
          <UIcon v-if="p.icon" :name="p.icon" class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
          <div v-else class="w-5 h-5 flex-shrink-0" />
          
          <span v-if="isSidebarExpanded" class="text-sm font-medium truncate">{{ p.name }}</span>
          
          <!-- Active Indicator (Left dot) -->
          <div v-if="route.params.pluginName === p.name && !isSidebarExpanded" class="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-indigo-500 rounded-r-full"></div>
        </router-link>
      </template>
    </div>

    <!-- 3. Bottom Actions -->
    <div class="mt-auto flex flex-col p-2 border-t border-zinc-800 bg-zinc-800 space-y-1">
      
      <!-- Settings (With Popover Menu) -->
      <div ref="menuRef" class="relative w-full">
        <button 
          @click="toggleMenu" 
          class="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors"
          :class="[
            isMenuOpen 
              ? 'bg-zinc-800 text-indigo-400'
              : 'text-gray-400 hover:text-gray-200 hover:bg-zinc-800/50',
            !isSidebarExpanded ? 'justify-center' : ''
          ]"
          title="Manage"
        >
          <UIcon name="Cog6Tooth" class="w-4 h-4" /> 
          <span v-if="isSidebarExpanded">General</span>
        </button>

        <!-- Popover Menu -->
        <div 
          v-if="isMenuOpen"
          class="absolute bottom-full mb-2 rounded-lg shadow-2xl overflow-hidden min-w-[180px] z-50 flex flex-col py-1 bg-zinc-950/70 backdrop-blur-xl border border-zinc-800"
          :class="isSidebarExpanded ? 'left-2' : 'left-full ml-2'"
        >
          <!-- Custom items from plugins (before settings) -->
          <template v-if="customMenuItems.length > 0">
            <button 
              v-for="(item, idx) in customMenuItems"
              :key="item.pluginName + idx"
              @click="handleCustomItemClick(item)"
              class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors text-gray-400 hover:bg-zinc-800 hover:text-gray-200"
            >
              <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
              <div v-else class="w-4 h-4" />
              {{ item.label }}
            </button>
            <div class="h-px my-1 mx-2 bg-zinc-900"></div>
          </template>

          <button 
            @click="handleMenuItemClick('settings')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors text-gray-400 hover:bg-zinc-800 hover:text-gray-200"
          >
            <UIcon name="AdjustmentsHorizontal" class="w-4 h-4" /> Settings
          </button>
          
          <div class="h-px my-1 mx-2 bg-zinc-900"></div>
          
          <button 
            @click="handleMenuItemClick('about')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors text-gray-400 hover:bg-zinc-800 hover:text-gray-200"
          >
            <UIcon name="InformationCircle" class="w-4 h-4" /> About
          </button>
        </div>
      </div>
    </div>
    </div>
    
    <!-- Toggle Sidebar Button (Right side, small and always visible) -->
    <button
      @click="isSidebarExpanded = !isSidebarExpanded"
      class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 cursor-pointer transition-all flex items-center justify-center z-20 rounded-r-lg shadow-lg group bg-zinc-800 border border-zinc-800 hover:bg-zinc-700 hover:border-white/20"
      title="Toggle Sidebar"
    >
      <UIcon 
        :name="isSidebarExpanded ? 'ChevronLeft' : 'ChevronRight'" 
        class="w-3 h-3 transition-colors text-gray-400"
      />
    </button>
  </div>
</template>
