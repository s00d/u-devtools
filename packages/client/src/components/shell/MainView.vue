<script setup lang="ts">
import { useDevToolsState } from '../../composables/useDevToolsState';
import { systemApi, createApiForPlugin } from '../../modules/clientApi';
import PluginRenderer from '../PluginRenderer.vue';
import AboutPanel from '../AboutPanel.vue';
import PluginManager from '../PluginManager.vue';
import { UIcon } from '@u-devtools/ui';

const { currentPlugin, isAboutActive, isManagerActive } = useDevToolsState();
</script>

<template>
  <div 
    class="flex-1 flex flex-col min-w-0 min-h-0 relative z-0 overflow-hidden"
    style="background-color: var(--udt-bg-root);"
  >
    <!-- Internal Views -->
    <AboutPanel v-if="isAboutActive" />
    <PluginManager v-else-if="isManagerActive" :api="systemApi" />
    
    <!-- Plugin View -->
    <div v-else-if="currentPlugin" class="flex-1 overflow-hidden relative min-w-0 min-h-0">
      <PluginRenderer :renderer="currentPlugin.renderMain" :api="createApiForPlugin(currentPlugin.name)" />
    </div>
    
    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-zinc-600 flex-col gap-2">
      <UIcon name="Cube" class="w-16 h-16 opacity-50" />
      <p class="text-zinc-500">Select a plugin to start</p>
    </div>
  </div>
</template>

