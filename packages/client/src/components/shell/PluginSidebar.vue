<script setup lang="ts">
import { useDevToolsState } from '../../composables/useDevToolsState';
import PluginRenderer from '../PluginRenderer.vue';
import { createApiForPlugin } from '../../modules/clientApi';

const { currentPlugin, isAboutActive, isManagerActive } = useDevToolsState();
</script>

<template>
  <div
    v-if="!isAboutActive && !isManagerActive && currentPlugin?.renderSidebar"
    class="w-64 flex-none border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col"
  >
    <div class="h-10 border-b dark:border-gray-700 flex items-center px-4 font-semibold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
      {{ currentPlugin.name }} Menu
    </div>
    <div class="flex-1 overflow-hidden relative">
      <PluginRenderer :renderer="currentPlugin.renderSidebar" :api="createApiForPlugin(currentPlugin.name)" />
    </div>
  </div>
</template>

