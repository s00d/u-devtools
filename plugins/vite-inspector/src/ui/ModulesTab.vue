<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { UInput, USplitter, UCodeBlock, UBadge, ULoading, UIcon, UButton, UVirtualList } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

// Получаем настройку редактора из глобальных настроек (General settings)
// Настройки General хранятся с префиксом 'general:'
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

const openInEditor = async (file: string, line = 1, column = 1) => {
  try {
    await props.api.rpc.call('sys:openFile', {
      file,
      line,
      column,
      editor: editor.value,
    });
    props.api.notify(`Opening ${file} in ${editor.value}`, 'success');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    props.api.notify(`Failed to open file: ${message}`, 'error');
  }
};

type Module = {
  id: string;
  file: string | null;
  type: string;
  acceptedHmr: boolean;
  importers: number;
};

const searchQuery = ref('');
const modules = ref<Module[]>([]);
const selectedModule = ref<Module | null>(null);
const moduleDetails = ref<{
  id: string;
  file: string | null;
  source: string;
  transformed: string;
} | null>(null);
const loadingDetails = ref(false);

const loadModules = async () => {
  try {
    modules.value = await props.api.rpc.call('vite:modules:list', searchQuery.value || '');
  } catch (e) {
    props.api.notify(`Failed to load modules: ${e}`, 'error');
  }
};

const getModuleKey = (item: unknown): string | number => {
  const mod = item as Module;
  return mod.id;
};

const selectModule = async (mod: Module) => {
  selectedModule.value = mod;
  loadingDetails.value = true;
  try {
    moduleDetails.value = await props.api.rpc.call('vite:modules:read', mod.id);
  } catch (e) {
    props.api.notify('Failed to load module details', 'error');
    moduleDetails.value = null;
  } finally {
    loadingDetails.value = false;
  }
};

onMounted(() => {
  loadModules();
});
</script>

<template>
  <div class="flex-1 flex overflow-hidden min-w-0 min-h-0">
    <!-- List -->
    <div class="w-1/3 border-r border-gray-700 flex flex-col min-w-[300px] bg-gray-800 min-h-0 overflow-hidden">
      <div class="p-2 border-b border-gray-700">
        <UInput 
          v-model="searchQuery" 
          placeholder="Search modules..." 
          @enter="loadModules"
          class="w-full"
        >
          <template #suffix>
            <button @click="loadModules" class="text-gray-400 hover:text-gray-200">
              <UIcon name="MagnifyingGlass" class="w-4 h-4" />
            </button>
          </template>
        </UInput>
      </div>
      <UVirtualList
        :items="modules"
        :key-field="getModuleKey"
        class="flex-1"
      >
        <template #default="{ item, index }">
          <div
            @click="selectModule(item as Module)"
            class="p-2 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors text-xs font-mono break-all"
            :class="selectedModule?.id === (item as Module).id ? 'bg-indigo-900/30 text-indigo-300' : 'text-gray-300'"
          >
            <div class="truncate" :title="(item as Module).id">{{ (item as Module).id }}</div>
            <div class="flex gap-1 mt-1">
              <UBadge size="xs" color="gray">{{ (item as Module).type }}</UBadge>
              <UBadge v-if="(item as Module).acceptedHmr" size="xs" color="green">HMR</UBadge>
              <span class="text-[10px] text-gray-400">{{ (item as Module).importers }} importers</span>
            </div>
          </div>
        </template>
        <template #empty>
          <div class="p-4 text-center text-gray-400 text-sm">
            No modules found
          </div>
        </template>
      </UVirtualList>
    </div>

    <!-- Detail View (Diff) -->
    <div class="flex-1 flex flex-col overflow-hidden bg-gray-900 min-w-0 min-h-0">
      <div v-if="!selectedModule" class="m-auto text-gray-400 text-center">
        <UIcon name="DocumentText" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Select a module to view transformation</p>
      </div>

      <div v-else-if="loadingDetails" class="m-auto">
        <ULoading />
      </div>
      
      <div v-else-if="moduleDetails" class="flex-1 flex flex-col h-full">
        <div class="px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center gap-2">
          <UIcon name="DocumentText" class="w-4 h-4 text-gray-400 shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="text-xs text-gray-400 mb-0.5 font-normal" v-if="moduleDetails.file">
              {{ moduleDetails.file }}
            </div>
            <div class="text-sm font-mono text-white break-all" :title="moduleDetails.id">
              {{ moduleDetails.id }}
            </div>
          </div>
          <UButton 
            v-if="moduleDetails.file" 
            variant="ghost" 
            size="sm" 
            icon="CodeBracket" 
            @click="openInEditor(moduleDetails.file, 1, 1)"
            title="Open in IDE"
          >
            Open in IDE
          </UButton>
        </div>
        
        <USplitter :defaultSize="400" class="flex-1 min-h-0 min-w-0">
          <template #left>
            <div class="h-full flex flex-col border-r border-gray-700 min-w-0 min-h-0 overflow-hidden">
              <div class="p-2 bg-gray-800 text-xs font-bold text-center border-b border-gray-700 text-gray-300 flex-shrink-0">
                Original Source
              </div>
              <div class="flex-1 overflow-hidden min-h-0 min-w-0">
                <UCodeBlock language="typescript" class="h-full w-full">
                  {{ moduleDetails.source }}
                </UCodeBlock>
              </div>
            </div>
          </template>
          <template #right>
            <div class="h-full flex flex-col min-w-0 min-h-0 overflow-hidden">
              <div class="p-2 bg-gray-800 text-xs font-bold text-center border-b border-gray-700 text-gray-300 flex-shrink-0">
                Transformed (Vite Result)
              </div>
              <div class="flex-1 overflow-hidden min-h-0 min-w-0">
                <UCodeBlock language="javascript" class="h-full w-full">
                  {{ moduleDetails.transformed }}
                </UCodeBlock>
              </div>
            </div>
          </template>
        </USplitter>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

