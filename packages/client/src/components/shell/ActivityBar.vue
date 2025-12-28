<script setup lang="ts">
import { useDevToolsState } from '../../composables/useDevToolsState';
import { UIcon } from '@u-devtools/ui';

const { plugins, activePluginId, isSidebarExpanded, isAboutActive, isManagerActive, showSettings, closeDevTools } = useDevToolsState();
</script>

<template>
  <div
    class="flex-none bg-gray-900 border-r border-gray-800 z-10 flex flex-col transition-all duration-300 ease-in-out"
    :class="isSidebarExpanded ? 'w-64' : 'w-16'"
  >
    <!-- Header -->
    <div class="h-14 flex items-center px-4 border-b border-gray-800" :class="isSidebarExpanded ? 'justify-between' : 'justify-center'">
      <div v-if="isSidebarExpanded" class="font-bold text-white tracking-wide truncate">DevTools</div>
      <button 
        @click="isSidebarExpanded = !isSidebarExpanded"
        class="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-800"
        :title="isSidebarExpanded ? 'Collapse' : 'Expand'"
      >
        <UIcon :name="isSidebarExpanded ? 'ChevronLeft' : 'Bars3'" class="w-5 h-5" />
      </button>
    </div>

    <!-- Plugin List -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-hide">
      <button
        v-for="p in plugins"
        :key="p.name"
        @click="activePluginId = p.name"
        :title="!isSidebarExpanded ? p.name : ''"
        class="w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 relative group border-l-2 border-transparent"
        :class="[
          activePluginId === p.name ? 'bg-gray-800 text-white border-indigo-500' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50',
          !isSidebarExpanded ? 'justify-center' : ''
        ]"
      >
        <UIcon :name="p.icon" class="w-5 h-5 shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis transition-opacity duration-200">{{ p.name }}</span>
        
        <!-- Tooltip (Only when collapsed) -->
        <div 
          v-if="!isSidebarExpanded"
          class="absolute left-14 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-gray-700"
        >
          {{ p.name }}
        </div>
      </button>
    </div>

    <!-- Bottom Actions -->
    <div class="mt-auto flex flex-col py-4 border-t border-gray-800 space-y-1">
      <button 
        @click="activePluginId = 'internal:about'" 
        class="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition group relative border-l-2" 
        :class="[isAboutActive ? 'bg-gray-800 text-white border-indigo-500' : 'border-transparent', !isSidebarExpanded ? 'justify-center' : '']" 
        :title="!isSidebarExpanded ? 'About' : ''"
      >
        <UIcon name="InformationCircle" class="w-5 h-5 shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">About</span>
      </button>

      <button 
        @click="activePluginId = 'internal:plugins'" 
        class="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition group relative border-l-2" 
        :class="[isManagerActive ? 'bg-gray-800 text-white border-indigo-500' : 'border-transparent', !isSidebarExpanded ? 'justify-center' : '']" 
        :title="!isSidebarExpanded ? 'Plugins Manager' : ''"
      >
        <UIcon name="Squares2X2" class="w-5 h-5 shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">Plugins</span>
      </button>

      <div class="h-px bg-gray-800 my-2 mx-4"></div>

      <button 
        @click="showSettings = true" 
        class="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 transition group" 
        :class="!isSidebarExpanded ? 'justify-center' : ''" 
        :title="!isSidebarExpanded ? 'Settings' : ''"
      >
        <UIcon name="Cog6Tooth" class="w-5 h-5 shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">Settings</span>
      </button>
      
      <button 
        @click="closeDevTools" 
        class="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition group" 
        :class="!isSidebarExpanded ? 'justify-center' : ''" 
        :title="!isSidebarExpanded ? 'Close' : ''"
      >
        <UIcon name="XMark" class="w-5 h-5 shrink-0" />
        <span v-if="isSidebarExpanded" class="text-sm">Close</span>
      </button>
    </div>
  </div>
</template>

