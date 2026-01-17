<script setup lang="ts">
import { computed } from 'vue';
import { UFileTree, ULoading, UEmpty, type TreeNode } from '@u-devtools/ui';
import { useRepo } from '../../composables/useRepo';
import type { FileNode } from '../../types';

const repo = useRepo();

// Loading states
const isLoading = computed(() => repo.isLoading.value);
const isAnalyzing = computed(() => repo.isAnalyzing.value);

// Format file size helper
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Convert FileNode[] to TreeNode[] format for UFileTree
const convertToTreeNode = (nodes: FileNode[]): TreeNode[] => {
  // Build children map
  const childrenMap = new Map<string | null, FileNode[]>();
  for (const node of nodes) {
    const pid = node.parent_id || null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid)!.push(node);
  }

  // Sort function: directories first, then alphabetically
  const sortNodes = (a: FileNode, b: FileNode) => {
    if (a.is_directory !== b.is_directory) {
      return a.is_directory ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  };

  // Recursive conversion
  const convertNode = (node: FileNode): TreeNode => {
    const children = (childrenMap.get(node.id) || []).sort(sortNodes);
    
    return {
      id: node.id,
      label: node.name,
      icon: node.is_directory ? 'Folder' : 'DocumentText',
      isSelected: node.selected,
      isExpanded: node.expanded,
      children: children.length > 0 ? children.map(convertNode) : undefined,
      data: {
        fileNode: node,
        isFile: !node.is_directory,
        isDirectory: node.is_directory,
        relativePath: node.relative_path,
        fullPath: node.path,
      },
    };
  };

  // Get root nodes (nodes without parent)
  const rootNodes = (childrenMap.get(null) || []).sort(sortNodes);
  return rootNodes.map(convertNode);
};

// Convert nodes to tree format
const treeNodes = computed(() => {
  if (repo.searchQuery.value.trim()) {
    // When searching, show flat list of search results
    const resultsSet = new Set(repo.searchResults.value);
    const matchingNodes = repo.nodes.value.filter((n) => resultsSet.has(n.id));
    return matchingNodes.map((node) => ({
      id: node.id,
      label: node.name,
      icon: node.is_directory ? 'Folder' : 'DocumentText',
      isSelected: node.selected,
      data: {
        fileNode: node,
        isFile: !node.is_directory,
        isDirectory: node.is_directory,
        relativePath: node.relative_path,
        fullPath: node.path,
      },
    }));
  }
  
  return convertToTreeNode(repo.nodes.value);
});

// Handle node selection (checkbox click)
const handleNodeSelect = (node: TreeNode) => {
  const fileNode = node.data?.fileNode as FileNode | undefined;
  if (!fileNode) return;

  // Toggle selection (works for both files and directories)
  repo.toggleSelection(fileNode.id);
  
  // If it's a file, also show preview
  if (!fileNode.is_directory) {
    repo.selectedFilePath.value = fileNode.id;
  }
};

// Handle node expand/collapse
const handleNodeExpand = (node: TreeNode, expanded: boolean) => {
  const fileNode = node.data?.fileNode as FileNode | undefined;
  if (!fileNode || !fileNode.is_directory) return;

  // Update expanded state
  repo.toggleExpanded(fileNode.id);
  
  // If expanding and children not loaded, trigger lazy loading
  if (expanded && fileNode.expanded === false) {
    // Children will be loaded automatically when node.expanded becomes true
    // The tree will re-render with children from repo.nodes
  }
};

// Handle node click
const handleNodeClick = (node: TreeNode) => {
  const fileNode = node.data?.fileNode as FileNode | undefined;
  if (!fileNode) return;

  if (!fileNode.is_directory) {
    // For files, select and show preview
    repo.selectedFilePath.value = fileNode.id;
  }
};

// Get selected file ID for highlighting (convert null to undefined)
const selectedFileId = computed(() => repo.selectedFilePath.value ?? undefined);
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900">
    <!-- Loading -->
    <div v-if="isLoading || isAnalyzing" class="flex items-center justify-center h-full">
      <div class="flex flex-col items-center animate-pulse">
        <ULoading text="Scanning..." />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="treeNodes.length === 0" class="flex items-center justify-center h-full">
      <UEmpty
        icon="Folder"
        title="No files found"
        :description="repo.searchQuery ? 'No results found' : 'Select a folder to get started'"
      />
    </div>

    <!-- File Tree -->
    <UFileTree
      v-else
      :nodes="treeNodes"
      :selected-id="selectedFileId"
      :expand-all="false"
      :show-header="false"
      :is-file-node="(node) => (node.data?.isFile as boolean) ?? false"
      @node-select="handleNodeSelect"
      @node-expand="handleNodeExpand"
      @node-click="handleNodeClick"
    >
      <template #checkbox="{ node, isSelected }">
        <div class="flex items-center justify-center w-4 h-4 mr-1.5 shrink-0" @click.stop>
          <input
            type="checkbox"
            class="w-3.5 h-3.5 rounded cursor-pointer border-gray-600 bg-gray-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 checked:bg-indigo-600 checked:border-indigo-600"
            :checked="isSelected"
            :aria-label="`Select ${node.data?.isDirectory ? 'folder' : 'file'}: ${node.label}`"
            @change="handleNodeSelect(node)"
          />
        </div>
      </template>
      <template #label="{ node }">
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <span class="text-sm text-gray-200 truncate">{{ node.label }}</span>
          <span
            v-if="!node.data?.isDirectory && (node.data?.fileNode as FileNode)?.size"
            class="text-xs text-gray-500 ml-auto flex-shrink-0"
          >
            {{ formatFileSize((node.data?.fileNode as FileNode).size || 0) }}
          </span>
          <span
            v-if="!node.data?.isDirectory && (node.data?.fileNode as FileNode)?.token_count"
            class="text-xs text-gray-600 ml-2 flex-shrink-0"
            title="Estimated tokens"
          >
            ~{{ Math.ceil((node.data?.fileNode as FileNode).token_count || 0) }}
          </span>
        </div>
      </template>
    </UFileTree>
  </div>
</template>
