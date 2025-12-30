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

const handleMenuItemClick = (action: 'settings' | 'about' | 'extensions') => {
  isMenuOpen.value = false;
  if (action === 'settings') showSettings.value = true;
  if (action === 'about') activePluginId.value = 'internal:about';
  if (action === 'extensions') activePluginId.value = 'internal:plugins';
};
</script>

<template>
  <div class="relative flex">
    <div
      class="flex-none z-10 flex flex-col transition-all duration-300 ease-in-out select-none border-r"
      :style="{ 
        borderColor: 'var(--udt-border)',
        backgroundColor: 'var(--udt-bg-surface)'
      }"
      :class="isSidebarExpanded ? 'w-64' : 'w-14'"
    >
      <!-- 1. Header (Logo area) -->
      <div 
        class="h-12 flex items-center border-b relative"
        :style="{ borderColor: 'var(--udt-border)' }"
        :class="isSidebarExpanded ? 'px-4' : 'justify-center'"
      >
        <!-- Логотип с градиентом -->
        <div v-if="!isSidebarExpanded" class="w-8 h-8 rounded bg-gradient-to-br from-[#18181b] to-[#27272a] border border-white/10 flex items-center justify-center shadow-sm">
          <UIcon name="WrenchScrewdriver" class="w-4 h-4 text-indigo-400" />
        </div>

        <div v-if="isSidebarExpanded" class="font-bold text-sm tracking-wide opacity-80 flex-1" :style="{ color: 'var(--udt-text)' }">U-DEVTOOLS</div>
        
        <!-- Close Button (Subtle) -->
        <button
          @click="closeDevTools"
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/10 hover:text-red-400 transition-colors"
          :style="{ color: 'var(--udt-text-dim)' }"
          v-if="isSidebarExpanded"
        >
          <UIcon name="XMark" class="w-4 h-4" />
        </button>
      </div>

    <!-- 2. Plugins List -->
    <div class="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-hide">
      <button
        v-for="p in plugins"
        :key="p.name"
        @click="activePluginId = p.name"
        class="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 group relative border border-transparent"
        :class="[
          activePluginId === p.name
            ? 'shadow-sm'
            : '',
          !isSidebarExpanded ? 'justify-center' : ''
        ]"
        :style="activePluginId === p.name 
          ? { 
              backgroundColor: 'var(--udt-bg-hover)', 
              color: '#818cf8',
              borderColor: 'rgba(255, 255, 255, 0.05)'
            }
          : { 
              color: 'var(--udt-text-dim)'
            }"
        @mouseenter="(e) => {
          if (activePluginId !== p.name) {
            e.currentTarget.style.color = 'var(--udt-text)';
            e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)';
          }
        }"
        @mouseleave="(e) => {
          if (activePluginId !== p.name) {
            e.currentTarget.style.color = 'var(--udt-text-dim)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }"
      >
        <UIcon :name="p.icon" class="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
        
        <span v-if="isSidebarExpanded" class="text-sm font-medium truncate">{{ p.name }}</span>
        
        <!-- Active Indicator (Left dot) -->
        <div v-if="activePluginId === p.name && !isSidebarExpanded" class="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-3 bg-indigo-500 rounded-r-full"></div>
      </button>
    </div>

    <!-- 3. Bottom Actions -->
    <div class="mt-auto flex flex-col p-2 border-t space-y-1" :style="{ borderColor: 'var(--udt-border)', backgroundColor: 'var(--udt-bg-surface)' }">
      
      <!-- Settings (With Popover Menu) -->
      <div ref="menuRef" class="relative w-full">
        <button 
          @click="toggleMenu" 
          class="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          :style="isMenuOpen 
            ? { backgroundColor: 'var(--udt-bg-hover)', color: '#818cf8' }
            : { color: 'var(--udt-text-dim)' }"
          :class="!isSidebarExpanded ? 'justify-center' : ''"
          @mouseenter="(e) => {
            if (!isMenuOpen) {
              e.currentTarget.style.color = 'var(--udt-text)';
              e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)';
            }
          }"
          @mouseleave="(e) => {
            if (!isMenuOpen) {
              e.currentTarget.style.color = 'var(--udt-text-dim)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }"
          title="Manage"
        >
          <UIcon name="Cog6Tooth" class="w-4 h-4" /> 
          <span v-if="isSidebarExpanded">General</span>
        </button>

        <!-- Popover Menu -->
        <div 
          v-if="isMenuOpen"
          class="absolute bottom-full mb-2 rounded-lg shadow-2xl overflow-hidden min-w-[180px] z-50 flex flex-col py-1"
          :style="{ 
            backgroundColor: 'var(--udt-glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--udt-border)'
          }"
          :class="isSidebarExpanded ? 'left-2' : 'left-full ml-2'"
        >
          <button 
            @click="handleMenuItemClick('settings')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors"
            :style="{ color: 'var(--udt-text-dim)' }"
            @mouseenter="(e) => { e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)'; e.currentTarget.style.color = 'var(--udt-text)'; }"
            @mouseleave="(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--udt-text-dim)'; }"
          >
            <UIcon name="AdjustmentsHorizontal" class="w-4 h-4" /> Settings
          </button>
          
          <button 
            @click="handleMenuItemClick('extensions')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors"
            :style="isManagerActive 
              ? { backgroundColor: 'var(--udt-bg-hover)', color: 'var(--udt-text)' }
              : { color: 'var(--udt-text-dim)' }"
            @mouseenter="(e) => { e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)'; e.currentTarget.style.color = 'var(--udt-text)'; }"
            @mouseleave="(e) => { 
              if (!isManagerActive) {
                e.currentTarget.style.backgroundColor = 'transparent'; 
                e.currentTarget.style.color = 'var(--udt-text-dim)'; 
              }
            }"
          >
            <UIcon name="Squares2X2" class="w-4 h-4" /> Extensions
          </button>
          
          <div class="h-px my-1 mx-2" :style="{ backgroundColor: 'var(--udt-border-subtle)' }"></div>
          
          <button 
            @click="handleMenuItemClick('about')"
            class="flex items-center gap-2 px-4 py-2 text-sm text-left w-full transition-colors"
            :style="{ color: 'var(--udt-text-dim)' }"
            @mouseenter="(e) => { e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)'; e.currentTarget.style.color = 'var(--udt-text)'; }"
            @mouseleave="(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--udt-text-dim)'; }"
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
      class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 cursor-pointer transition-all flex items-center justify-center z-20 rounded-r-lg shadow-lg group"
      :style="{ 
        backgroundColor: 'var(--udt-bg-surface)',
        border: '1px solid var(--udt-border)'
      }"
      @mouseenter="(e) => {
        e.currentTarget.style.backgroundColor = 'var(--udt-bg-hover)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
      }"
      @mouseleave="(e) => {
        e.currentTarget.style.backgroundColor = 'var(--udt-bg-surface)';
        e.currentTarget.style.borderColor = 'var(--udt-border)';
      }"
      title="Toggle Sidebar"
    >
      <UIcon 
        :name="isSidebarExpanded ? 'ChevronLeft' : 'ChevronRight'" 
        class="w-3 h-3 transition-colors"
        :style="{ color: 'var(--udt-text-dim)' }"
      />
    </button>
  </div>
</template>

<style scoped>
/* Скрытие скроллбара */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
