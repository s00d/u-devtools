<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue';
import { useRepo } from '../../composables/useRepo';
import { useApi } from '../../context';
import { UButton, UIcon } from '@u-devtools/ui';
import type { ProgressEvent } from '../../types';

const repo = useRepo();
const api = useApi();
const showMenu = ref(false);
const isGenerating = ref(false);
const progress = ref<ProgressEvent | null>(null);

// Get modal open function from parent
const openModal = inject<(content: { success: boolean; message: string; content?: string; isTruncated?: boolean }) => void>('openGenerationModal', () => {
  console.warn('[repo2txt] Modal not available');
});

let progressUnlisten: (() => void) | undefined;

onMounted(() => {
  const unsub = api.rpc.on('repo2txt:generation-progress', (data: unknown) => {
    progress.value = data as ProgressEvent;
  });
  progressUnlisten = unsub;
});

onUnmounted(() => {
  progressUnlisten?.();
});

async function handleExport() {
  isGenerating.value = true;
  progress.value = null;

  try {
    const result = await repo.generateMarkdown();

    if (result) {
      openModal({
        success: true,
        message: 'Markdown generated successfully!',
        content: result.preview_content,
        isTruncated: result.is_truncated,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : 'Failed to generate markdown';
    
    console.error('[repo2txt] Export error:', {
      error: errorMessage,
      errorObject: error,
    });
    
    openModal({
      success: false,
      message: `Export failed: ${errorMessage}`,
    });
  } finally {
    isGenerating.value = false;
    progress.value = null;
  }
}

function handleClearConfig() {
  if (confirm('Clear saved configuration? This will reset all file selections and folder expansions.')) {
    repo.clearConfig();
  }
}

function handleSelectAll() {
  repo.selectAll();
  showMenu.value = false;
}

function handleDeselectAll() {
  repo.deselectAll();
  showMenu.value = false;
}

function handleCollapseAll() {
  repo.collapseAll();
  showMenu.value = false;
}

function handleRefresh() {
  if (repo.rootPath.value) {
    repo.openDirectory(repo.rootPath.value);
  }
  showMenu.value = false;
}
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Menu -->
    <div class="relative">
      <UButton
        variant="ghost"
        size="sm"
        icon="MoreHorizontal"
        aria-label="More options"
        aria-haspopup="true"
        :aria-expanded="showMenu"
        @click="showMenu = !showMenu"
      />
      <div
        v-if="showMenu"
        role="menu"
        aria-label="File tree actions"
        class="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-1 overflow-hidden z-50"
        @click.stop
      >
        <button
          role="menuitem"
          aria-label="Select all files"
          @click="handleSelectAll"
          class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <UIcon name="Check" class="w-4 h-4" aria-hidden="true" />
          Select All Files
        </button>
        <button
          role="menuitem"
          aria-label="Deselect all files"
          @click="handleDeselectAll"
          class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <UIcon name="XMark" class="w-4 h-4" aria-hidden="true" />
          Deselect All
        </button>
        <div class="h-px bg-gray-700 my-1" role="separator" aria-orientation="horizontal"></div>
        <button
          role="menuitem"
          aria-label="Collapse all folders"
          @click="handleCollapseAll"
          class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <UIcon name="ChevronUp" class="w-4 h-4" aria-hidden="true" />
          Collapse All
        </button>
        <button
          role="menuitem"
          aria-label="Refresh file tree"
          @click="handleRefresh"
          class="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <UIcon name="ArrowPath" class="w-4 h-4" aria-hidden="true" />
          Refresh
        </button>
      </div>
    </div>

    <div class="h-4 w-px bg-gray-700"></div>

    <!-- Clear Configuration Button -->
    <UButton
      variant="ghost"
      size="sm"
      icon="Trash"
      label="Clear Config"
      :disabled="!repo.rootPath"
      aria-label="Clear saved configuration"
      title="Clear saved configuration (file selections and folder expansions)"
      @click="handleClearConfig"
    />

    <!-- Export Button with Progress -->
    <UButton
      variant="primary"
      size="sm"
      :icon="isGenerating ? 'ArrowPath' : 'ArrowDownOnRectangle'"
      :label="isGenerating && progress ? `${Math.round((progress.current / progress.total) * 100)}%` : 'Export'"
      :disabled="isGenerating || !repo.rootPath"
      :aria-label="isGenerating ? 'Generating markdown...' : 'Export to markdown'"
      :aria-busy="isGenerating"
      @click="handleExport"
    />
  </div>
</template>
