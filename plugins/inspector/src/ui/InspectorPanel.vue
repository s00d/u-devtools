<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UEmpty, UIcon, UTabs, USplitter } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';
import { useInspector } from '../composables/useInspector';
import { useElementData, type ElementInfo } from '../composables/useElementData';
import DomTreeAdapter from './components/DomTreeAdapter.vue';
import ComputedTab from './tabs/ComputedTab.vue';
import StylesTab from './tabs/StylesTab.vue';
import A11yTab from './tabs/A11yTab.vue';

const props = defineProps<{ api: ClientApi }>();

const { isInspecting, toggleInspect, selectNode, bridge } = useInspector();
const { data, updateStyle, updateAttr, addAttr, deleteAttr, addClass, removeClass, updateClasses } =
  useElementData(bridge);

const activeTab = ref('Computed');

const handleSelectNode = (payload: { type: 'parent' | 'sibling' | 'child'; index?: number }) => {
  // Передаем информацию о текущем элементе для поиска, если currentTarget не установлен
  // Преобразуем массив classes в строку для сериализации через BroadcastChannel
  const currentElement = data.value
    ? {
        tagName: data.value.tagName,
        id: data.value.id,
        classes: Array.isArray(data.value.classes)
          ? data.value.classes.join(' ')
          : data.value.classes,
      }
    : undefined;

  selectNode(payload.type, payload.index, currentElement);
};

// Обработка переключения таба из overlay
const handleTabSwitch = (e: Event) => {
  const detail = (e as CustomEvent<{ pluginName: string; tabName: string }>).detail;
  if (
    detail.pluginName === 'Inspector' &&
    ['Computed', 'Styles', 'A11y'].includes(detail.tabName)
  ) {
    activeTab.value = detail.tabName;
  }
};

// Обработка событий от bridge
onMounted(() => {
  // Обработка выбора элемента (из режима Pick Element или из дерева DOM)
  bridge.on<ElementInfo>('element-picked', (elementData) => {
    data.value = elementData;
    isInspecting.value = false; // Отключаем режим инспектирования
  });

  bridge.on('inspector-cancelled', () => {
    isInspecting.value = false;
  });

  // Обработка переключения таба из overlay
  window.addEventListener('u-devtools:switch-tab', handleTabSwitch);
});

onUnmounted(() => {
  bridge.close();
  window.removeEventListener('u-devtools:switch-tab', handleTabSwitch);
});

onUnmounted(() => {
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    
    <!-- Toolbar -->
    <div class="h-10 border-b border-gray-800 flex items-center px-3 gap-2 bg-gray-800 flex-none">
      <UButton 
        :variant="isInspecting ? 'primary' : 'ghost'" 
        icon="MagnifyingGlass" 
        size="sm"
        @click="toggleInspect"
        :class="{ 'animate-pulse': isInspecting }"
      >
        {{ isInspecting ? 'Pick Element...' : '' }}
      </UButton>
      <div class="h-4 w-px bg-gray-700 mx-1"></div>
      <div v-if="data" class="flex gap-1 text-xs font-mono">
        <span class="text-indigo-500 font-bold">&lt;{{ data.tagName }}&gt;</span>
        <span v-if="data.id" class="text-yellow-500">#{{ data.id }}</span>
        <span v-if="data.classes.length" class="text-blue-500">.{{ data.classes[0] }}</span>
        <span v-if="data.classes.length > 1" class="text-gray-400">+{{ data.classes.length - 1 }}</span>
      </div>
    </div>

    <div v-if="data" class="flex-1 overflow-hidden relative">
      <USplitter :defaultSize="300" :min="200" :max="600">
        
        <!-- LEFT: DOM TREE -->
        <template #left>
          <DomTreeAdapter :domContext="data.domContext" @select-node="handleSelectNode" />
        </template>

        <!-- RIGHT: DETAILS PANELS -->
        <template #right>
          <div class="h-full flex flex-col bg-gray-900">
            <!-- Tabs Header -->
            <div class="px-3 border-b border-gray-800 bg-gray-800 flex-none">
              <UTabs :items="['Computed', 'Styles', 'A11y']" v-model="activeTab" />
            </div>

            <div class="flex-1 overflow-auto">
              
              <!-- COMPUTED TAB -->
              <ComputedTab 
                v-if="activeTab === 'Computed'"
                :data="data"
                @update-style="updateStyle"
              />

              <!-- STYLES TAB -->
              <StylesTab 
                v-if="activeTab === 'Styles'"
                :data="data"
                @update-classes="updateClasses"
                @update-attr="(name, value) => updateAttr(name, value)"
                @delete-attr="deleteAttr"
                @add-attr="(name, value) => addAttr(name, value)"
                @add-class="addClass"
                @remove-class="removeClass"
              />

              <!-- A11Y TAB -->
              <A11yTab 
                v-if="activeTab === 'A11y'"
                :data="data"
              />

            </div>
          </div>
        </template>
      </USplitter>
    </div>

    <UEmpty v-else title="Inspect Element" description="Select an element to view details" icon="MagnifyingGlass" />
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
