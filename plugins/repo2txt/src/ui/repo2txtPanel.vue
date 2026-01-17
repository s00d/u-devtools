<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import { useRepo } from '../composables/useRepo';
import { useApi } from '../context';
import { UPluginLayout, USplitter, UButton, UInput, UIcon } from '@u-devtools/ui';
import ToolbarActions from './components/ToolbarActions.vue';
import FileTree from './components/FileTree.vue';
import FilePreview from './components/FilePreview.vue';
import StatsPanel from './components/StatsPanel.vue';
import GenerationModal from './components/GenerationModal.vue';

const repo = useRepo();
const api = useApi();
const searchQuery = ref('');

// Modal state
const modalOpen = ref(false);
const modalContent = ref<{
  success: boolean;
  message: string;
  content?: string;
  isTruncated?: boolean;
} | null>(null);

// Provide modal open function for child components
function openGenerationModal(content: { success: boolean; message: string; content?: string; isTruncated?: boolean }) {
  modalContent.value = content;
  modalOpen.value = true;
}

provide('openGenerationModal', openGenerationModal);

onMounted(async () => {
  // Listeners are set up automatically when useRepo() is called
  // Try to open last path or current directory
  const lastPath = repo.rootPath.value || null;
  if (lastPath) {
    repo.openDirectory(lastPath);
  } else {
    // Try to get current directory
    try {
      const currentDir = await api.rpc.call<string>('repo2txt:get-current-directory');
      if (currentDir) {
        repo.openDirectory(currentDir);
      }
    } catch (error) {
      console.warn('[repo2txt] Failed to get current directory:', error);
    }
  }
});

function handleSearch() {
  repo.searchNodes(searchQuery.value);
}

function clearSearch() {
  searchQuery.value = '';
  repo.searchNodes('');
}

async function handleOpenDirectory() {
  try {
    if ('showDirectoryPicker' in window) {
      const directoryHandle = await (window as any).showDirectoryPicker({
        mode: 'read',
      });
      
      const dirName = directoryHandle.name;
      const path = await api.dialog.prompt({
        title: 'Open Directory',
        message: `Enter full path for directory "${dirName}":`,
        defaultValue: repo.rootPath.value || '',
      });
      
      if (path) {
        repo.openDirectory(path);
      }
    } else {
      const path = await api.dialog.prompt({
        title: 'Open Directory',
        message: 'Enter directory path:',
        defaultValue: repo.rootPath.value || '',
      });
      
      if (path) {
        repo.openDirectory(path);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('[repo2txt] Error selecting directory:', error);
      api.notify('Failed to select directory', 'error');
    }
  }
}

async function handleNavigateUp() {
  await repo.navigateToParent();
}

function handleRevealInExplorer() {
  repo.revealInExplorer();
}
</script>

<template>
  <UPluginLayout title="Repo2Txt" icon="Cube">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        
        <!-- Navigate Up Button -->
        <UButton
          variant="ghost"
          size="sm"
          icon="ArrowUp"
          :disabled="!repo.rootPath"
          aria-label="Go to parent directory"
          title="Go to parent directory"
          @click="handleNavigateUp"
        />
        
        <!-- Address Bar -->
        <div class="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden transition-all hover:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 h-8">
          <button
            class="flex items-center gap-2 px-3 h-full text-left overflow-hidden hover:bg-gray-600 transition-colors outline-none min-w-[200px] max-w-[400px]"
            aria-label="Change folder"
            title="Change folder..."
            @click="handleOpenDirectory"
          >
            <UIcon name="FolderOpen" class="w-4 h-4 text-yellow-500 shrink-0" />
            <span
              class="truncate text-xs font-mono text-gray-200 leading-normal"
              :class="!repo.rootPath ? 'opacity-50 italic' : ''"
            >
              {{ repo.rootPath || 'Select Project Folder...' }}
            </span>
          </button>
          
          <div v-if="repo.rootPath" class="w-px h-4 bg-gray-600 shrink-0"></div>
          
          <button
            v-if="repo.rootPath"
            class="px-2.5 h-full flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-gray-600 transition-colors shrink-0 outline-none"
            aria-label="Reveal in File Explorer / Finder"
            title="Reveal in File Explorer / Finder"
            @click.stop="handleRevealInExplorer"
          >
            <UIcon name="FolderOpen" class="w-4 h-4" />
          </button>
        </div>
      </div>
    </template>
    
    <template #actions>
      <!-- Search -->
      <div class="w-64 relative group">
        <UInput
          v-model="searchQuery"
          placeholder="Search files..."
          aria-label="Search files"
          size="sm"
          @input="handleSearch"
        />
        <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
          <button
            v-if="searchQuery"
            aria-label="Clear search"
            title="Clear search"
            @click="clearSearch"
            class="text-gray-400 hover:text-gray-300 cursor-pointer transition-colors pointer-events-auto"
          >
            <UIcon name="XMark" class="w-4 h-4" aria-hidden="true" />
          </button>
          <UIcon
            v-else
            name="MagnifyingGlass"
            class="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          />
        </div>
      </div>
      
      <ToolbarActions />
    </template>

    <!-- Content with Splitter -->
    <div class="flex flex-col h-full">
      <USplitter :default-size="400" :min="250" :max="800" persistence-key="repo2txt:splitter-size" class="flex-1 min-h-0">
        <template #left>
          <div class="h-full overflow-hidden bg-gray-900">
            <FileTree />
          </div>
        </template>
        
        <template #right>
          <div class="h-full overflow-hidden bg-gray-900">
            <FilePreview />
          </div>
        </template>
      </USplitter>

      <!-- Stats Panel -->
      <StatsPanel />
    </div>
    
    <!-- Generation Modal -->
    <GenerationModal :visible="modalOpen" :content="modalContent" @close="modalOpen = false" />
  </UPluginLayout>
</template>
