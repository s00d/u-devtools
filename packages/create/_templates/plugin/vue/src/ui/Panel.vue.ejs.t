---
to: <%= projectName %>/src/ui/<%= pluginName.replace(/\s+/g, '') %>Panel.vue
---
<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '../context';
import {
  UIcon,
  UTabs,
  UButton,
} from '@u-devtools/ui';
import BasicComponents from '../views/BasicComponents.vue';
import LayoutComponents from '../views/LayoutComponents.vue';
import DataDisplay from '../views/DataDisplay.vue';
import StateComponents from '../views/StateComponents.vue';
import Forms from '../views/Forms.vue';

const api = useApi();

const TAB_ITEMS = ['Basic', 'Layout', 'Data', 'State', 'Forms'];
const activeTab = ref('Basic');

const resetTab = () => {
  activeTab.value = 'Basic';
};

const renderContent = () => {
  switch (activeTab.value) {
    case 'Basic':
      return BasicComponents;
    case 'Layout':
      return LayoutComponents;
    case 'Data':
      return DataDisplay;
    case 'State':
      return StateComponents;
    case 'Forms':
      return Forms;
    default:
      return BasicComponents;
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="CodeBracket" class="w-5 h-5" />
            <%= pluginName %>
          </h2>
          <div class="flex items-center gap-2">
            <div class="h-4 w-px bg-gray-700"></div>
            <UTabs
              :items="TAB_ITEMS"
              :model-value="activeTab"
              @update:model-value="activeTab = $event"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton label="Reset" variant="ghost" size="sm" icon="ArrowPath" @click="resetTab" />
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto p-6">
      <component :is="renderContent()" />
    </div>
  </div>
</template>

