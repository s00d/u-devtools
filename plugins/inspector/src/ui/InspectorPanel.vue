<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UJsonTree, UEmpty } from '@u-devtools/ui';
import { AppBridge } from '@u-devtools/core';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

interface ComponentInfo {
  framework: 'Vue' | 'React';
  name: string;
  file: string;
  line?: number;
}

interface ElementInfo {
  tagName: string;
  id: string;
  classes: string[];
  attrs: Record<string, string>;
  innerText?: string;
  rect: { x: number; y: number; width: number; height: number };
  computed: Record<string, string>;
  component: ComponentInfo | null;
  breadcrumbs: Array<{ tagName: string; id: string; class: string }>;
}

const isInspecting = ref(false);
const data = ref<ElementInfo | null>(null);
const bridge = new AppBridge('inspector');

const toggle = () => {
  isInspecting.value = !isInspecting.value;
  bridge.send('toggle-inspector', { state: isInspecting.value });
};

const openInEditor = async () => {
  if (data.value?.component?.file) {
    try {
      await props.api.rpc.call('sys:openFile', {
        file: data.value.component.file,
        line: data.value.component.line || 1,
        column: 1,
      });
    } catch (e) {
      props.api.notify(`Failed to open file: ${e}`, 'error');
    }
  }
};

let unsubscribe: (() => void) | undefined;
let unsubscribeCancel: (() => void) | undefined;

onMounted(() => {
  unsubscribe = bridge.on<ElementInfo>('element-picked', (elementData) => {
    data.value = elementData;
    isInspecting.value = false;
  });

  unsubscribeCancel = bridge.on('inspector-cancelled', () => {
    isInspecting.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (unsubscribeCancel) unsubscribeCancel();
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar -->
    <div class="p-3 border-b border-udt-c-border flex items-center justify-between bg-gray-50 dark:bg-gray-800 flex-none">
      <div class="flex items-center gap-3">
        <UButton :variant="isInspecting ? 'primary' : 'secondary'" icon="i-carbon-search-locate" @click="toggle">
          {{ isInspecting ? 'Inspecting...' : 'Select Element' }}
        </UButton>
        <div v-if="data" class="flex items-center gap-2 text-sm font-mono">
          <span class="text-indigo-600 font-bold">&lt;{{ data.tagName }}&gt;</span>
          <span v-if="data.id" class="text-yellow-600">#{{ data.id }}</span>
          <span v-for="cls in data.classes.slice(0, 3)" :key="cls" class="text-green-600">.{{ cls }}</span>
          <span v-if="data.classes.length > 3" class="text-gray-400">+{{ data.classes.length - 3 }}</span>
        </div>
      </div>

      <UButton
        v-if="data?.component"
        variant="ghost"
        size="sm"
        icon="i-carbon-code"
        @click="openInEditor"
        title="Open Component Source"
      >
        {{ data.component.name }}
      </UButton>
    </div>

    <!-- Content -->
    <div v-if="data" class="flex-1 flex flex-col overflow-hidden">
      <div class="flex-1 overflow-auto p-4 space-y-6">
        <!-- Component Banner -->
        <div
          v-if="data.component"
          class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 flex items-start gap-3"
        >
          <div
            :class="data.component.framework === 'Vue' ? 'i-carbon-logo-vue' : 'i-carbon-logo-react'"
            class="text-2xl text-indigo-500 mt-0.5"
          />
          <div class="flex-1">
            <div class="font-bold text-indigo-900 dark:text-indigo-100">{{ data.component.name }}</div>
            <div class="text-xs text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{{ data.component.file }}</div>
            <div v-if="data.component.line" class="text-xs text-indigo-500 dark:text-indigo-500 mt-0.5">
              Line {{ data.component.line }}
            </div>
          </div>
        </div>

        <!-- Box Model Visualizer -->
        <div class="flex justify-center py-4 select-none text-[10px] text-gray-500 dark:text-gray-400">
          <div
            class="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 p-6 relative"
            title="Margin"
          >
            <span class="absolute top-1 left-2 font-semibold">margin</span>
            <div
              class="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-6 relative"
              title="Border"
            >
              <span class="absolute top-1 left-2 font-semibold">border</span>
              <div
                class="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 p-6 relative"
                title="Padding"
              >
                <span class="absolute top-1 left-2 font-semibold">padding</span>
                <div
                  class="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 w-32 h-16 flex items-center justify-center font-mono text-blue-800 dark:text-blue-200"
                  title="Content"
                >
                  {{ Math.round(data.rect.width) }} × {{ Math.round(data.rect.height) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attributes -->
        <div v-if="Object.keys(data.attrs).length > 0">
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Attributes</h3>
          <div class="bg-gray-50 dark:bg-gray-800 rounded border border-udt-c-border divide-y divide-udt-c-border">
            <div
              v-for="(val, key) in data.attrs"
              :key="key"
              class="grid grid-cols-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div class="p-2 font-mono text-indigo-600 dark:text-indigo-400 border-r border-udt-c-border">{{ key }}</div>
              <div class="p-2 font-mono text-gray-700 dark:text-gray-300 col-span-2 break-all">{{ val }}</div>
            </div>
          </div>
        </div>

        <!-- Computed Styles -->
        <div>
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Computed Styles</h3>
          <div class="grid grid-cols-2 gap-2 text-sm font-mono bg-gray-50 dark:bg-gray-800 rounded border border-udt-c-border p-3">
            <div v-for="(val, key) in data.computed" :key="key" class="flex justify-between border-b border-udt-c-border pb-1">
              <span class="text-gray-500 dark:text-gray-400">{{ key }}:</span>
              <span class="text-gray-900 dark:text-gray-100">{{ val }}</span>
            </div>
          </div>
        </div>

        <!-- Text Content -->
        <div v-if="data.innerText">
          <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Text Content</h3>
          <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-udt-c-border font-mono text-sm">
            {{ data.innerText }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <UEmpty v-else icon="i-carbon-search" title="Select an element to inspect" description="Click 'Select Element' button and then select an element on the page" />

    <!-- Breadcrumbs Footer -->
    <div
      v-if="data"
      class="flex-none border-t border-udt-c-border bg-gray-50 dark:bg-gray-800 p-2 flex overflow-x-auto gap-1 text-xs whitespace-nowrap"
    >
      <div
        v-for="(crumb, idx) in data.breadcrumbs"
        :key="idx"
        class="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-gray-600 dark:text-gray-300 transition-colors"
      >
        <span class="font-bold">{{ crumb.tagName }}</span>
        <span v-if="crumb.id" class="text-yellow-600 dark:text-yellow-400">#{{ crumb.id }}</span>
        <span v-if="crumb.class" class="text-green-600 dark:text-green-400 max-w-[100px] truncate">.{{ crumb.class }}</span>
        <div v-if="idx < data.breadcrumbs.length - 1" class="i-carbon-chevron-right text-gray-400 ml-1" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep functionality */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
</style>
