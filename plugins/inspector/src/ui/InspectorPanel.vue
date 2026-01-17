<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UEmpty, UIcon, UTabs, USplitter, UPluginLayout } from '@u-devtools/ui';
import { onOverlayReady } from '@u-devtools/overlay';
import { useBridge, useApi } from '../context';
import { useInspector as useInspectorComposable } from '../composables/useInspector';
import { useElementData, type ElementInfo } from '../composables/useElementData';
import DomTreeAdapter from './components/DomTreeAdapter.vue';
import ComputedTab from './tabs/ComputedTab.vue';
import StylesTab from './tabs/StylesTab.vue';
import A11yTab from './tabs/A11yTab.vue';

const bridge = useBridge();
const api = useApi();

const { isInspecting, toggleInspect, selectNode } = useInspectorComposable();
const { data, updateStyle, updateAttr, addAttr, deleteAttr, addClass, removeClass, updateClasses } =
  useElementData();

const activeTab = ref('Computed');

const STORAGE_KEY_LAST_SELECTOR = 'inspector:last-selector';

const handleSelectNode = (payload: { type: 'parent' | 'sibling' | 'child'; index?: number }) => {
  // Pass current element info for search if currentTarget not set
  // Convert classes array to string for serialization via BroadcastChannel
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

// Обработка ESC и клика вне попапа
const handleClosePopup = () => {
  isInspecting.value = false;
};

const handleOutsideClick = () => {
  isInspecting.value = false;
};

const handleClearSelection = () => {
  data.value = null;
  bridge.send('clear-selection', {});
  api.storage.remove(STORAGE_KEY_LAST_SELECTOR);
};

// Handle tab switch from overlay
const handleTabSwitch = (e: Event) => {
  const detail = (e as CustomEvent<{ pluginName: string; tabName: string }>).detail;
  if (
    detail.pluginName === 'Inspector' &&
    ['Computed', 'Styles', 'A11y'].includes(detail.tabName)
  ) {
    activeTab.value = detail.tabName;
  }
};

// Handle events from bridge
onMounted(() => {
  // Handle element selection (from Pick Element mode or from DOM tree)
  bridge.on('element-picked', (elementData) => {
    data.value = elementData;
    isInspecting.value = false; // Disable inspection mode
    
    // Сохраняем селектор для восстановления
    const selector = buildSelector(elementData);
    if (selector) {
      api.storage.set(STORAGE_KEY_LAST_SELECTOR, selector);
    }
  });
  
  // Строим селектор из данных элемента
  function buildSelector(elementData: ElementInfo): string {
    let selector = elementData.tagName.toLowerCase();
    if (elementData.id) {
      selector += `#${elementData.id}`;
    }
    if (elementData.classes && elementData.classes.length > 0) {
      selector += `.${elementData.classes.join('.')}`;
    }
    return selector;
  }

  bridge.on('inspector-cancelled', () => {
    isInspecting.value = false;
  });

  // Handle tab switch from overlay
  window.addEventListener('u-devtools:switch-tab', handleTabSwitch);
  
  // Lazy Load selection - восстанавливаем выбранный элемент
  const lastSelector = api.storage.get<string>(STORAGE_KEY_LAST_SELECTOR, '');
  if (lastSelector) {
    // Ждем готовности overlay перед отправкой события
    onOverlayReady().then(() => {
      // Дополнительная небольшая задержка для гарантии инициализации bridge на стороне app
      setTimeout(() => {
        try {
          bridge.send('restore-selection', { selector: lastSelector });
        } catch (e) {
          // Игнорируем ошибки, если канал все еще не готов
          console.warn('[Inspector] Failed to restore selection:', e);
        }
      }, 100);
    }).catch((e) => {
      console.warn('[Inspector] Overlay ready check failed:', e);
    });
  }
});

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
  window.removeEventListener('u-devtools:switch-tab', handleTabSwitch);
});
</script>

<template>
  <UPluginLayout title="Inspector" icon="MagnifyingGlass">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        <UButton
          :variant="isInspecting ? 'primary' : 'ghost'"
          icon="MagnifyingGlass"
          size="sm"
          @click="toggleInspect"
          :class="{ 'animate-pulse': isInspecting }"
        >
          {{ isInspecting ? 'Pick Element...' : 'Inspect' }}
        </UButton>
        <div v-if="data" class="flex gap-1 text-xs font-mono ml-2">
          <span class="text-indigo-500 font-bold">&lt;{{ data.tagName }}&gt;</span>
          <span v-if="data.id" class="text-yellow-500">#{{ data.id }}</span>
          <span v-if="data.classes.length" class="text-blue-500">.{{ data.classes[0] }}</span>
          <span v-if="data.classes.length > 1" class="text-gray-400">+{{ data.classes.length - 1 }}</span>
        </div>
        <UButton
          v-if="data"
          variant="ghost"
          size="sm"
          icon="XMark"
          @click="handleClearSelection"
          title="Clear selection"
        />
      </div>
    </template>

    <div v-if="data" class="h-full overflow-hidden relative">
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
              <UTabs :items="['Computed', 'Styles', 'A11y']" :model-value="activeTab" @update:model-value="activeTab = $event" />
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

    <!-- Inspector Active Popup -->
    <div
      v-if="isInspecting"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
      @click.self="handleOutsideClick"
    >
      <div class="bg-[#252526] p-6 rounded-xl shadow-2xl text-center border border-indigo-500 pointer-events-auto relative">
        <button
          @click="handleClosePopup"
          class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded transition-colors"
        >
          <UIcon name="XMark" class="w-5 h-5" />
        </button>
        <UIcon name="MagnifyingGlass" class="w-12 h-12 mx-auto text-indigo-400 mb-4 animate-bounce" />
        <h3 class="text-xl font-bold text-white mb-2">Pick an element</h3>
        <p class="text-gray-400">Hover and click on any element to inspect it.</p>
        <p class="text-xs text-gray-500 mt-4">Press ESC to cancel</p>
      </div>
    </div>
  </UPluginLayout>
</template>
