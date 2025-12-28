<script setup lang="ts">
import { ref, computed } from 'vue';
import { UIcon } from '@u-devtools/ui';
import type { TreeNode } from '../types';

const props = defineProps<{
  node: TreeNode;
  selectedFile: string;
  depth: number;
}>();

const emit = defineEmits<{
  fileSelected: [fullPath: string];
}>();

const isExpanded = ref(false);
const isSelected = computed(() => props.selectedFile === props.node.fullPath);

const indentStyle = computed(() => ({
  paddingLeft: `${props.depth * 20 + 8}px`,
}));

function handleClick() {
  if (props.node.isFile) {
    emit('fileSelected', props.node.fullPath);
  } else {
    isExpanded.value = !isExpanded.value;
  }
}
</script>

<template>
  <div>
    <div
      v-if="node.isFile"
      :class="['file-item', { selected: isSelected }]"
      :style="indentStyle"
      @click="handleClick"
    >
      <UIcon name="DocumentText" class="w-4 h-4 mr-2 text-gray-400" />
      <span class="text-sm text-gray-300">{{ node.name }}</span>
    </div>
    <div v-else>
      <div
        :class="['folder-header', { expanded: isExpanded }]"
        :style="indentStyle"
        @click="handleClick"
      >
        <UIcon
          :name="isExpanded ? 'ChevronDown' : 'ChevronRight'"
          class="w-3 h-3 mr-2 text-gray-400"
        />
        <UIcon name="FolderOpen" class="w-4 h-4 mr-2 text-gray-400" />
        <span class="text-sm text-gray-300">{{ node.name }}</span>
      </div>
      <div v-if="isExpanded" class="ml-4">
        <TreeItem
          v-for="child in node.children"
          :key="child.fullPath"
          :node="child"
          :selected-file="selectedFile"
          :depth="depth + 1"
          @file-selected="$emit('fileSelected', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.file-item {
  @apply py-1 px-2 my-1 cursor-pointer flex items-center text-sm rounded transition-all duration-200 border border-transparent;
  @apply hover:bg-gray-700;
}

.file-item.selected {
  @apply bg-indigo-900/30 border-indigo-500 text-indigo-300 font-medium;
}

.folder-header {
  @apply py-1 px-2 my-1 cursor-pointer flex items-center text-sm rounded transition-all duration-200 border border-transparent;
  @apply hover:bg-gray-700;
}

.folder-header.expanded {
  @apply font-medium text-indigo-300;
}
</style>

