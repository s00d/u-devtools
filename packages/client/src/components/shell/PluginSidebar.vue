<script setup lang="ts">
import { useDevToolsState } from '../../composables/useDevToolsState';
import PluginRenderer from '../PluginRenderer.vue';
import { createApiForPlugin } from '../../modules/clientApi';

const { currentPlugin, isAboutActive, isManagerActive } = useDevToolsState();
</script>

<template>
  <div
    v-if="!isAboutActive && !isManagerActive && currentPlugin?.renderSidebar"
    class="w-64 flex-none border-r flex flex-col"
    :style="{ 
      borderColor: 'var(--udt-border)',
      backgroundColor: 'var(--udt-bg-surface)'
    }"
  >
    <div 
      class="h-12 border-b flex items-center px-4 font-semibold text-xs uppercase tracking-wider"
      :style="{ 
        borderColor: 'var(--udt-border)',
        backgroundColor: 'var(--udt-glass-bg)',
        backdropFilter: 'blur(12px)',
        color: 'var(--udt-text-dim)'
      }"
    >
      <!-- Logo Icon -->
      <div class="w-6 h-6 rounded bg-gradient-to-br from-[#18181b] to-[#27272a] border border-white/10 flex items-center justify-center shadow-sm mr-2">
        <UIcon :name="currentPlugin.icon" class="w-3.5 h-3.5 text-indigo-400" />
      </div>
      <!-- Plugin Name -->
      <span>{{ currentPlugin.name }} Menu</span>
    </div>
    <div class="flex-1 overflow-hidden relative min-w-0 min-h-0">
      <PluginRenderer :renderer="currentPlugin.renderSidebar" :api="createApiForPlugin(currentPlugin.name)" />
    </div>
  </div>
</template>

