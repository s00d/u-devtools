<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UInput, USplitter, UButton, ULoading, UModal } from '@u-devtools/ui';
import { useComponentTree } from '../../composables/useComponentTree';
import ComponentTree from '../components/ComponentTree.vue';
import ComponentState from '../components/ComponentState.vue';
import ComponentRenderCode from '../components/ComponentRenderCode.vue';

const props = defineProps<{ api: ClientApi }>();

const componentTree = useComponentTree();

// Получаем настройку редактора из глобальных настроек
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
const inspectComponentTipVisible = ref(false);

const copyFilePath = async () => {
  if (selectedComponent.value?.file) {
    try {
      await navigator.clipboard.writeText(selectedComponent.value.file);
      props.api.notify('File path copied to clipboard', 'success');
    } catch (error) {
      props.api.notify(`Failed to copy path: ${error}`, 'error');
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
      await props.api.rpc.call('sys:openFile', {
        file: selectedComponent.value.file,
        line: selectedComponent.value.line || 1,
        column: selectedComponent.value.column || 1,
        editor: editor.value,
      });
      props.api.notify(`Opening ${selectedComponent.value.file} in ${editor.value}`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      props.api.notify(`Failed to open file: ${message}`, 'error');
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

const inspectComponentInspector = async () => {
  inspectComponentTipVisible.value = true;
  try {
    const data = await componentTree.inspectComponentInspector();
    if (data) {
      // Select the component that was inspected
      const node = componentTree.flattenedTree.value.find(n => n.id === data.id);
      if (node) {
        await componentTree.selectComponent(node);
        // Expand parent nodes
        const expandParents = (nodes: typeof componentTree.flattenedTree.value, targetId: string) => {
          for (const node of nodes) {
            if (node.id === targetId) {
              return true;
            }
            if (node.children) {
              if (expandParents(node.children, targetId)) {
                componentTree.expandedNodes.value.add(node.id);
                return true;
              }
            }
          }
          return false;
        };
        expandParents(componentTree.componentTree.value, data.id);
      }
    }
  } finally {
    inspectComponentTipVisible.value = false;
  }
};

const cancelInspectComponentInspector = () => {
  inspectComponentTipVisible.value = false;
  componentTree.cancelInspectComponentInspector();
};

// Keyboard shortcuts
onMounted(() => {
  componentTree.getComponentTree();
  
  // Global shortcuts via api.shortcuts
  props.api.shortcuts.register(['Meta', 'S'], () => {
    if (!inspectComponentTipVisible.value) {
      inspectComponentInspector();
    }
  });
  props.api.shortcuts.register(['Ctrl', 'S'], () => {
    if (!inspectComponentTipVisible.value) {
      inspectComponentInspector();
    }
  });
  
  // Local shortcuts for navigation (only when component tab is active)
  const handleKeyDown = (event: KeyboardEvent) => {
    // Escape для отмены inspect
    if (event.key === 'Escape' && inspectComponentTipVisible.value) {
      cancelInspectComponentInspector();
      return;
    }
    
    // Навигация работает только когда компонент в фокусе или активен
    const isActive = document.activeElement?.closest('.components-tab') || 
                     document.querySelector('.components-tab')?.classList.contains('active');
    
    if (!isActive) return;
    
    const selectedId = componentTree.selectedComponentId.value;
    if (!selectedId) return;
    
    const flattened = componentTree.flattenedTree.value;
    const currentIndex = flattened.findIndex(n => n.id === selectedId);
    
    switch (event.key) {
      case 'ArrowRight': {
        // Expand if collapsed and has children
        const node = flattened.find(n => n.id === selectedId);
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
    <div class="flex-none px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between">
      <UInput
        v-model="componentTree.filterText.value"
        placeholder="Filter components..."
        class="w-64"
      />
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          size="sm"
          icon="CursorArrowRays"
          @click="inspectComponentInspector"
        >
          Inspect
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

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden relative">
      <div v-if="componentTree.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
        <ULoading text="Loading components..." />
      </div>
      <USplitter :defaultSize="300" class="flex-1">
        <template #left>
          <ComponentTree
            :tree="componentTree.componentTree.value"
            :selected-id="componentTree.selectedComponentId.value"
            :expanded-nodes="componentTree.expandedNodes.value"
            @select="handleSelect"
            @hover="handleHover"
            @leave="handleLeave"
            @toggle-expanded="handleToggleExpanded"
          />
        </template>
        <template #right>
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
    </div>
    
    <!-- Inspect Component Dialog -->
    <UModal
      :visible="inspectComponentTipVisible"
      title="Inspect Component"
      @close="cancelInspectComponentInspector"
    >
      <div class="p-4 text-center">
        <p class="text-gray-300 mb-4">Click on a component in the page to inspect it</p>
        <p class="text-sm text-gray-500">Press Escape to cancel</p>
      </div>
    </UModal>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

