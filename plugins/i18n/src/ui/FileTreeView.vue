<script setup lang="ts">
import { computed } from 'vue';
import { UFileTree, type TreeNode } from '@u-devtools/ui';
import type { TreeNode as I18nTreeNode } from '../types';

const props = defineProps<{
  tree: I18nTreeNode[];
  selectedFile: string;
}>();

const emit = defineEmits<{
  fileSelected: [fullPath: string];
}>();

// Convert i18n TreeNode to UFileTree TreeNode format
const convertToUTreeNode = (node: I18nTreeNode, parentPath = ''): TreeNode => {
  const fullPath = node.fullPath || `${parentPath}/${node.name}`.replace(/\/+/g, '/');
  const isSelected = props.selectedFile === fullPath;
  return {
    id: fullPath,
    label: node.name,
    icon: node.isFile ? 'DocumentText' : 'FolderOpen',
    isSelected,
    children:
      node.children && node.children.length > 0
        ? node.children.map((child) => convertToUTreeNode(child, fullPath))
        : undefined,
    data: {
      fullPath,
      isFile: node.isFile,
    },
  };
};

const treeNodes = computed(() => props.tree.map((node) => convertToUTreeNode(node)));

const handleNodeSelect = (node: TreeNode) => {
  const fullPath = node.data?.fullPath as string;
  const isFile = node.data?.isFile;
  if (fullPath && isFile) {
    emit('fileSelected', fullPath);
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

