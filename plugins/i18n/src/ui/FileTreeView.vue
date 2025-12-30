<script setup lang="ts">
import { computed } from 'vue';
import { UTreeView, UIcon, type TreeNode } from '@u-devtools/ui';
import type { TreeNode as I18nTreeNode } from '../types';

const props = defineProps<{
  tree: I18nTreeNode[];
  selectedFile: string;
}>();

const emit = defineEmits<{
  fileSelected: [fullPath: string];
}>();

// Преобразуем i18n TreeNode в формат UTreeView TreeNode
const convertToUTreeNode = (node: I18nTreeNode, parentPath = ''): TreeNode => {
  const fullPath = node.fullPath || `${parentPath}/${node.name}`.replace(/\/+/g, '/');
  return {
    id: fullPath,
    label: node.name,
    icon: node.isFile ? 'DocumentText' : 'FolderOpen',
    isSelected: props.selectedFile === fullPath,
    isExpanded: !node.isFile, // Папки раскрыты по умолчанию
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
  if (fullPath && node.data?.isFile) {
    emit('fileSelected', fullPath);
  }
};
</script>

<template>
  <UTreeView
    :nodes="treeNodes"
    :show-header="false"
    :expand-all="true"
    @node-select="handleNodeSelect"
  >
    <template #node="{ node, isExpanded, toggleExpand, handleClick }">
      <div
        class="py-1 px-2 my-1 cursor-pointer flex items-center text-sm rounded transition-all duration-200"
        :class="node.isSelected 
          ? 'bg-indigo-900/30 border border-indigo-500 text-indigo-300 font-medium' 
          : 'border border-transparent hover:bg-gray-700'"
        @click="handleClick(node, $event)"
      >
        <UIcon
          v-if="node.children && node.children.length > 0"
          :name="isExpanded ? 'ChevronDown' : 'ChevronRight'"
          class="w-3 h-3 mr-2"
          :style="{ color: 'var(--udt-text-dim)' }"
          @click.stop="toggleExpand(node, $event)"
        />
        <UIcon
          :name="node.icon || 'DocumentText'"
          class="w-4 h-4 mr-2"
          :style="{ color: 'var(--udt-text-dim)' }"
        />
        <span :style="{ color: node.isSelected ? 'var(--udt-text)' : 'var(--udt-text-dim)' }">
          {{ node.label }}
        </span>
      </div>
    </template>
  </UTreeView>
</template>

<style scoped>
@reference "tailwindcss";
</style>

