<script setup lang="ts">
import { computed } from 'vue';
import { UFileTree, type TreeNode } from '@u-devtools/ui';
import type { StoryFile } from '../types';
import type { FileTreeNode } from './composables/useStoryTree';

const props = defineProps<{
  tree: FileTreeNode[];
  selectedFile: string;
}>();

const emit = defineEmits<{
  fileSelected: [file: StoryFile];
}>();

// Helper to extract file from tree node
function findFileInTree(tree: FileTreeNode[], fullPath: string): StoryFile | undefined {
  for (const node of tree) {
    if (node.fullPath === fullPath && node.isFile && node.file) {
      return node.file;
    }
    if (node.children) {
      const found = findFileInTree(node.children, fullPath);
      if (found) return found;
    }
  }
  return undefined;
}

// Convert FileTreeNode to UFileTree TreeNode format
// Set isSelected like in i18n to match the pattern
const convertToUTreeNode = (node: FileTreeNode, parentPath = ''): TreeNode => {
  const fullPath = node.fullPath || `${parentPath}/${node.name}`.replace(/\/+/g, '/');
  const isSelected = props.selectedFile === fullPath;
  
  return {
    id: fullPath,
    label: node.name,
    icon: node.isFile ? 'DocumentText' : 'Folder',
    isSelected,
    children:
      node.children && node.children.length > 0
        ? node.children.map((child) => convertToUTreeNode(child, fullPath))
        : undefined,
    data: {
      fullPath,
      isFile: node.isFile,
      file: node.file,
    },
  };
};

// Tree nodes - computed like in i18n, Vue will handle key-based reuse
const treeNodes = computed(() => props.tree.map((node) => convertToUTreeNode(node)));

const handleNodeSelect = (node: TreeNode) => {
  const fullPath = node.data?.fullPath as string;
  const isFile = node.data?.isFile;
  if (fullPath && isFile) {
    // Try to get file from node data first, then search in tree
    let file = node.data?.file as StoryFile | undefined;
    if (!file) {
      file = findFileInTree(props.tree, fullPath);
    }
    if (file) {
      emit('fileSelected', file);
    }
  }
};
</script>

<template>
  <UFileTree
    :nodes="treeNodes"
    :selected-id="selectedFile"
    :expand-all="false"
    :show-header="false"
    :is-file-node="(node) => (node.data?.isFile as boolean) ?? false"
    @node-select="handleNodeSelect"
  />
</template>
