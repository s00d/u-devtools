<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { USplitter, ULoading } from '@u-devtools/ui';
import StorySidebar from './views/StorySidebar.vue';
import StoryHeader from './views/StoryHeader.vue';
import StoryPreviewTab from './views/StoryPreviewTab.vue';
import StorySourceTab from './views/StorySourceTab.vue';
import StoryDocsTab from './views/StoryDocsTab.vue';
import EmptyState from './views/EmptyState.vue';
import { useStoryTree } from './composables/useStoryTree';
import { useStorySelection } from './composables/useStorySelection';

const { tree, isFileListLoading, loadFiles } = useStoryTree();
const {
  selectedFile,
  meta,
  sourceCode,
  propValues,
  isStoryLoading,
  currentStoryComponent,
  currentTargetComponent,
  componentPropsMeta,
  storyDocs,
  selectStory,
} = useStorySelection();

const activeTab = ref('Preview');

const selectedFilePath = computed(() => {
  if (!selectedFile.value) return '';
  return selectedFile.value.path.replace(/^src\//, '');
});

const handleFileSelected = (file: import('../types').StoryFile) => {
  selectStory(file);
};

onMounted(() => {
  loadFiles();
});
</script>

<template>
  <div class="h-full flex bg-gray-900 text-gray-200">
    <USplitter :default-size="250" :min="200" :max="400">
      <!-- LEFT SIDEBAR: File Tree -->
      <template #left>
        <StorySidebar
          :tree="tree"
          :selected-file-path="selectedFilePath"
          :is-file-list-loading="isFileListLoading"
          @file-selected="handleFileSelected"
          @refresh="loadFiles"
        />
      </template>

      <!-- RIGHT CONTENT -->
      <template #right>
        <div v-if="selectedFile" class="h-full flex flex-col bg-gray-900 min-w-0">
          <!-- Header -->
          <StoryHeader
            :file-name="selectedFile.name"
            :file-path="selectedFile.path"
            :active-tab="activeTab"
            @update:active-tab="activeTab = $event"
          />

          <!-- Content Area -->
          <div class="flex-1 overflow-hidden relative">
            <ULoading v-if="isStoryLoading" text="Loading story..." class="absolute inset-0 z-50 bg-gray-900" />
            
            <template v-else>
              <!-- PREVIEW TAB -->
              <StoryPreviewTab
                v-show="activeTab === 'Preview'"
                :current-story-component="currentStoryComponent"
                :current-target-component="currentTargetComponent"
                :prop-values="propValues"
                :component-props-meta="componentPropsMeta"
                :meta="meta"
                @update:props="(newProps) => propValues = newProps"
              />

              <!-- SOURCE TAB -->
              <StorySourceTab
                v-show="activeTab === 'Source'"
                :source-code="sourceCode"
              />

              <!-- DOCS TAB -->
              <StoryDocsTab
                v-show="activeTab === 'Docs'"
                :story-docs="storyDocs"
                :meta="meta"
              />
            </template>
          </div>
        </div>

        <EmptyState v-else />
      </template>
    </USplitter>
  </div>
</template>
