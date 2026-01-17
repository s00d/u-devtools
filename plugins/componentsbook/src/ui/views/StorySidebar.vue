<script setup lang="ts">
import { ULoading, UEmpty, UIcon } from '@u-devtools/ui';
import FileTreeView from '../FileTreeView.vue';
import type { StoryFile } from '../../types';
import type { FileTreeNode } from '../composables/useStoryTree';

const props = defineProps<{
  tree: FileTreeNode[];
  selectedFilePath: string;
  isFileListLoading: boolean;
}>();

const emit = defineEmits<{
  'file-selected': [file: StoryFile];
  'refresh': [];
}>();

const handleFileSelected = (file: StoryFile) => {
  emit('file-selected', file);
};

const handleRefresh = () => {
  emit('refresh');
};
</script>

<template>
  <div class="h-full flex flex-col border-r border-gray-700 bg-gray-900">
    <div class="p-3 border-b border-gray-700 font-bold flex items-center justify-between flex-shrink-0 bg-gray-800">
      <span class="flex items-center gap-2 text-sm">
        <UIcon name="BookOpen" class="w-4 h-4 text-indigo-400" />
        Components
      </span>
      <button
        @click="handleRefresh"
        class="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
        title="Refresh List"
      >
        <UIcon name="ArrowPath" class="w-3.5 h-3.5" />
      </button>
    </div>
    
    <div class="flex-1 overflow-auto custom-scrollbar">
      <ULoading v-if="isFileListLoading" text="Scanning..." class="mt-8" />
      <FileTreeView
        v-else
        :tree="tree"
        :selected-file="selectedFilePath"
        @file-selected="handleFileSelected"
      />
      <UEmpty
        v-if="!isFileListLoading && tree.length === 0"
        title="No stories found"
        description="Create *.stories.vue files"
        icon="DocumentText"
      />
    </div>
  </div>
</template>
