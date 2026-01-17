<script setup lang="ts">
import { ref } from 'vue';
import { UTabs, UIcon } from '@u-devtools/ui';
import { useApi } from '../context';
import ModulesTab from './ModulesTab.vue';
import ResolveTab from './ResolveTab.vue';
import ConfigTab from './ConfigTab.vue';
import EventsTab from './EventsTab.vue';

const api = useApi();

const activeTab = ref('Modules');
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="Bolt" class="w-5 h-5" />
            Vite Inspector
          </h2>
          <div class="flex items-center gap-2">
            <div class="h-4 w-px bg-gray-700"></div>
            <UTabs
              :items="['Modules', 'Resolve', 'Config', 'Events']"
              :model-value="activeTab"
              @update:model-value="activeTab = $event"
            />
          </div>
        </div>
      </div>
    </div>

    <ModulesTab v-if="activeTab === 'Modules'" />
    <ResolveTab v-else-if="activeTab === 'Resolve'" />
    <ConfigTab v-else-if="activeTab === 'Config'" />
    <EventsTab v-else-if="activeTab === 'Events'" />
  </div>
</template>
