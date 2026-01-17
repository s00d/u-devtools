<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { UInput, USplitter, UButton, ULoading, UIcon } from '@u-devtools/ui';
import { useApi, useBridge } from '../../context';
import { useComponentTree } from '../../composables/useComponentTree';
import { useVueApps } from '../../composables/useVueApps';
import ComponentTree from '../components/ComponentTree.vue';
import ComponentState from '../components/ComponentState.vue';
import ComponentRenderCode from '../components/ComponentRenderCode.vue';
import VueAppsList from '../components/VueAppsList.vue';

const api = useApi();
const bridge = useBridge();

const vueApps = useVueApps();
const componentTree = useComponentTree(() => vueApps.selectedAppId.value);

// При переключении приложения обновляем дерево компонентов
watch(() => vueApps.selectedAppId.value, () => {
  if (vueApps.selectedAppId.value) {
    // Небольшая задержка, чтобы app успел переключиться
    setTimeout(() => {
      componentTree.getComponentTree();
    }, 100);
  }
});

// Также слушаем событие ready после переключения приложения
bridge.on('inspector:ready', () => {
  // После переключения приложения запрашиваем дерево компонентов
  componentTree.getComponentTree();
});

// Get editor setting from global settings
const editor = computed(() => {
  try {
    const saved = localStorage.getItem('u-devtools-global-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return (parsed['general:launchEditor'] as string) || 'code';
    }
  } catch {
    // ignore
  }
  return 'code';
});

// Render code state
const componentRenderCode = ref('');
const componentRenderCodeVisible = ref(false);

// Inspect component inspector state
const isInspecting = ref(false);

const copyFilePath = async () => {
  if (selectedComponent.value?.file) {
    try {
      await navigator.clipboard.writeText(selectedComponent.value.file);
      api.notify('File path copied to clipboard', 'success');
    } catch (error) {
      api.notify(`Failed to copy path: ${error}`, 'error');
    }
  }
};

const selectedComponent = computed(() => {
  if (!componentTree.selectedComponentId.value) return null;
  return componentTree.flattenedTree.value.find(
    (node) => node.id === componentTree.selectedComponentId.value
  );
});

const handleSelect = async (node: { id: string }) => {
  await componentTree.selectComponent(node as Parameters<typeof componentTree.selectComponent>[0]);
  await componentTree.highlightComponent(node.id);
};

const handleHover = (node: { id: string }) => {
  componentTree.highlightComponent(node.id);
};

const handleLeave = () => {
  componentTree.unhighlightComponent();
};

const handleToggleExpanded = (nodeId: string) => {
  componentTree.toggleExpanded(nodeId);
};

const openSelectedInEditor = async () => {
  if (selectedComponent.value?.file) {
    try {
      await api.rpc.call('sys:openFile', {
        file: selectedComponent.value.file,
        line: selectedComponent.value.line || 1,
        column: selectedComponent.value.column || 1,
        editor: editor.value,
      });
      api.notify(`Opening ${selectedComponent.value.file} in ${editor.value}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      api.notify(`Failed to open file: ${message}`, 'error');
    }
  }
};

const getComponentRenderCode = async () => {
  if (selectedComponent.value?.id) {
    const code = await componentTree.getComponentRenderCode(selectedComponent.value.id);
    componentRenderCode.value = code;
    componentRenderCodeVisible.value = true;
  }
};

const closeComponentRenderCode = () => {
  componentRenderCode.value = '';
  componentRenderCodeVisible.value = false;
};

const toggleInspect = () => {
  if (isInspecting.value) {
    isInspecting.value = false;
    bridge.send('inspector:disable');
  } else {
    isInspecting.value = true;
    bridge.send('inspector:enable');
  }
};

const handleClosePopup = () => {
  isInspecting.value = false;
  bridge.send('inspector:disable');
};

const handleOutsideClick = () => {
  isInspecting.value = false;
  bridge.send('inspector:disable');
};

// Keyboard shortcuts
onMounted(() => {
  componentTree.getComponentTree();

  // Global shortcuts via api.shortcuts
  api.shortcuts.register(['Meta', 'S'], () => {
    if (!isInspecting.value) {
      toggleInspect();
    }
  });
  api.shortcuts.register(['Ctrl', 'S'], () => {
    if (!isInspecting.value) {
      toggleInspect();
    }
  });

  // Слушаем выключение из App (после клика или ESC)
  bridge.on('inspector:disabled', () => {
    isInspecting.value = false;
  });

  // Local shortcuts for navigation (only when component tab is active)
  const handleKeyDown = (event: KeyboardEvent) => {
    // Escape to cancel inspect
    if (event.key === 'Escape' && isInspecting.value) {
      handleClosePopup();
      return;
    }

    // Navigation works only when component is focused or active
    const isActive =
      document.activeElement?.closest('.components-tab') ||
      document.querySelector('.components-tab')?.classList.contains('active');

    if (!isActive) return;

    const selectedId = componentTree.selectedComponentId.value;
    if (!selectedId) return;

    const flattened = componentTree.flattenedTree.value;
    const currentIndex = flattened.findIndex((n) => n.id === selectedId);

    switch (event.key) {
      case 'ArrowRight': {
        // Expand if collapsed and has children
        const node = flattened.find((n) => n.id === selectedId);
        if (node?.children && node.children.length > 0) {
          if (!componentTree.expandedNodes.value.has(selectedId)) {
            componentTree.toggleExpanded(selectedId);
          }
        }
        break;
      }
      case 'ArrowLeft': {
        // Collapse if expanded
        if (componentTree.expandedNodes.value.has(selectedId)) {
          componentTree.toggleExpanded(selectedId);
        }
        break;
      }
      case 'ArrowDown': {
        // Next component
        if (currentIndex >= 0 && currentIndex < flattened.length - 1) {
          const nextNode = flattened[currentIndex + 1];
          if (nextNode) {
            componentTree.selectComponent(nextNode);
          }
        }
        break;
      }
      case 'ArrowUp': {
        // Previous component
        if (currentIndex > 0) {
          const prevNode = flattened[currentIndex - 1];
          if (prevNode) {
            componentTree.selectComponent(prevNode);
          }
        }
        break;
      }
      case ' ':
      case 'Enter': {
        event.preventDefault();
        // Toggle expanded
        componentTree.toggleExpanded(selectedId);
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
});

onUnmounted(() => {
  componentTree.unhighlightComponent();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 components-tab">
    <!-- Toolbar -->
    <div class="flex-none px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between gap-4">
      <UInput
        v-model="componentTree.filterText.value"
        placeholder="Filter components..."
        class="w-64"
      />
      <div class="flex items-center gap-2">
        <UButton
          :variant="isInspecting ? 'primary' : 'ghost'"
          size="sm"
          icon="CursorArrowRays"
          @click="toggleInspect"
          :class="{ 'animate-pulse': isInspecting }"
        >
          {{ isInspecting ? 'Picking...' : 'Inspect' }}
        </UButton>
        <div v-if="selectedComponent" class="flex items-center gap-2">
          <UButton
            v-if="selectedComponent.file"
            variant="ghost"
            size="sm"
            icon="ClipboardDocument"
            @click="copyFilePath"
          >
            Copy Path
          </UButton>
          <UButton
            v-if="selectedComponent.file"
            variant="ghost"
            size="sm"
            icon="CodeBracket"
            @click="openSelectedInEditor"
          >
            Open in Editor
          </UButton>
          <UButton
            variant="ghost"
            size="sm"
            icon="Code"
            @click="getComponentRenderCode"
          >
            Render Code
          </UButton>
          <UButton
            variant="ghost"
            size="sm"
            icon="ArrowDown"
            @click="componentTree.scrollToComponent(selectedComponent.id)"
          >
            Scroll to
          </UButton>
        </div>
      </div>
    </div>

    <!-- Main Content - 3 Panel Layout -->
    <div class="flex-1 flex overflow-hidden relative">
      <div v-if="componentTree.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
        <ULoading text="Loading components..." />
      </div>
      <!-- Outer Splitter: Apps List (left) and Component Tree + State (right) -->
      <USplitter :defaultSize="200" :min="150" :max="300" class="flex-1" persistence-key="vue-inspector-apps-panel">
        <template #left>
          <!-- Panel 1: Apps List -->
          <VueAppsList
            :apps="vueApps.apps.value"
            :selected-app-id="vueApps.selectedAppId.value"
            @select="vueApps.switchApp"
          />
        </template>
        <template #right>
          <!-- Inner Splitter: Component Tree (left) and State (right) -->
          <USplitter :defaultSize="300" :min="200" :max="600" class="h-full" persistence-key="vue-inspector-tree-panel">
            <template #left>
              <!-- Panel 2: Component Tree -->
              <div class="h-full flex flex-col bg-gray-900 border-r border-gray-700">
                <div class="flex-none px-3 py-2 border-b border-gray-700 bg-gray-800/50">
                  <div class="text-xs text-gray-400 font-semibold uppercase tracking-wide">Component Tree</div>
                </div>
                <div class="flex-1 overflow-auto">
                  <ComponentTree
                    :tree="componentTree.componentTree.value"
                    :selected-id="componentTree.selectedComponentId.value"
                    :expanded-nodes="componentTree.expandedNodes.value"
                    @select="handleSelect"
                    @hover="handleHover"
                    @leave="handleLeave"
                    @toggle-expanded="handleToggleExpanded"
                  />
                </div>
              </div>
            </template>
            <template #right>
              <!-- Panel 3: Component State -->
              <div class="relative h-full">
                <ComponentState
                  :state="componentTree.componentState.value"
                  :is-loading="componentTree.isLoading.value"
                />
                <ComponentRenderCode
                  v-if="componentRenderCodeVisible && componentRenderCode"
                  :code="componentRenderCode"
                  @close="closeComponentRenderCode"
                />
              </div>
            </template>
          </USplitter>
        </template>
      </USplitter>
    </div>

    <!-- Inspect Component Popup -->
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
        <UIcon name="CursorArrowRays" class="w-12 h-12 mx-auto text-indigo-400 mb-4 animate-bounce" />
        <h3 class="text-xl font-bold text-white mb-2">Pick a component</h3>
        <p class="text-gray-400">Hover and click on any Vue component to inspect it.</p>
        <p class="text-xs text-gray-500 mt-4">Press ESC to cancel</p>
      </div>
    </div>
  </div>
</template>
