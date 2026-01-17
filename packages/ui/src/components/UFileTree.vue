<script setup lang="ts">
import { ref, watch } from 'vue';
import { tv } from 'tailwind-variants';
import UFileTreeNode from './UFileTreeNode.vue';
import type { TreeNode } from '../types';

const props = withDefaults(
  defineProps<{
    nodes: TreeNode[];
    selectedId?: string | number;
    expandAll?: boolean;
    showHeader?: boolean;
    title?: string;
    /**
     * Custom function to determine if a node is a file (for custom click behavior)
     * If not provided, uses node.data?.isFile or checks if node has no children
     */
    isFileNode?: (node: TreeNode) => boolean;
  }>(),
  {
    expandAll: false,
    showHeader: false,
    isFileNode: (node: TreeNode) => {
      // Default: node is a file if it has isFile in data or has no children
      return (node.data?.isFile as boolean) ?? (!node.children || node.children.length === 0);
    },
  }
);

const emit = defineEmits<{
  nodeClick: [node: TreeNode];
  nodeSelect: [node: TreeNode];
  nodeExpand: [node: TreeNode, expanded: boolean];
}>();

// Internal state for node expansion
const expandedNodes = ref<Set<string | number>>(new Set());

// Initialization: expand all if expandAll
if (props.expandAll && props.nodes) {
  const expandRecursive = (nodes: TreeNode[]) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        expandedNodes.value.add(node.id);
        expandRecursive(node.children);
      }
    });
  };
  expandRecursive(props.nodes);
}

// Preserve expandedNodes state when nodes change
// If nodes changed but node ids remained the same, preserve expandedNodes
watch(
  () => props.nodes,
  (newNodes, oldNodes) => {
    // If this is first initialization or nodes haven't changed structurally, do nothing
    if (!oldNodes || oldNodes.length === 0) return;
    
    // Create Set from old node ids for quick check
    const oldNodeIds = new Set<string | number>();
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        oldNodeIds.add(node.id);
        if (node.children) {
          collectIds(node.children);
        }
      });
    };
    collectIds(oldNodes);
    
    // Check if structure changed (nodes added/removed)
    const newNodeIds = new Set<string | number>();
    const collectNewIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        newNodeIds.add(node.id);
        if (node.children) {
          collectNewIds(node.children);
        }
      });
    };
    collectNewIds(newNodes);
    
    // If structure hasn't changed (same ids), preserve expandedNodes
    // If structure changed, clear expandedNodes for new nodes
    const nodesToKeep = new Set<string | number>();
    expandedNodes.value.forEach((id) => {
      if (newNodeIds.has(id)) {
        nodesToKeep.add(id);
      }
    });
    expandedNodes.value = nodesToKeep;
  },
  { deep: false }
);

const isNodeExpanded = (node: TreeNode): boolean => {
  if (node.isExpanded !== undefined) return node.isExpanded;
  return expandedNodes.value.has(node.id);
};

const toggleExpand = (node: TreeNode, event: MouseEvent) => {
  event.stopPropagation();
  const wasExpanded = isNodeExpanded(node);
  if (wasExpanded) {
    expandedNodes.value.delete(node.id);
  } else {
    expandedNodes.value.add(node.id);
  }
  emit('nodeExpand', node, !wasExpanded);
};

const handleNodeClick = (node: TreeNode, event: MouseEvent) => {
  const isFile = props.isFileNode(node);
  
  if (!isFile && node.children && node.children.length > 0) {
    // For folders - toggle expansion
    toggleExpand(node, event);
  }
  
  emit('nodeClick', node);
  emit('nodeSelect', node);
};

const isNodeSelected = (node: TreeNode): boolean => {
  return node.isSelected ?? node.id === props.selectedId;
};

const fileTree = tv({
  base: 'h-full flex flex-col border-r select-none bg-gradient-to-b from-zinc-900/40 via-zinc-800/30 to-zinc-900/40 border-zinc-800/50 backdrop-blur-sm',
});

const fileTreeHeader = tv({
  base: 'px-4 py-2.5 text-[10px] uppercase font-bold tracking-wider flex-none border-b border-zinc-800/60 bg-zinc-900/60 backdrop-blur-md text-gray-400/80',
});

const fileTreeContent = tv({
  base: 'flex-1 overflow-auto p-2 select-none scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent',
});

defineSlots<{
  label(props: { node: TreeNode }): unknown;
  checkbox(props: { node: TreeNode; isSelected: boolean }): unknown;
}>();
</script>

<template>
  <div :class="fileTree()">
    <!-- Header -->
    <div
      v-if="showHeader && title"
      :class="fileTreeHeader()"
    >
      {{ title }}
    </div>

    <!-- Tree Content -->
    <div :class="fileTreeContent()">
      <div class="space-y-0">
        <UFileTreeNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :is-expanded="isNodeExpanded"
          :is-selected="isNodeSelected"
          :is-file-node="isFileNode"
          :toggle-expand="toggleExpand"
          :handle-click="handleNodeClick"
        >
          <template #label="slotProps">
            <slot name="label" v-bind="slotProps" />
          </template>
          <template #checkbox="checkboxProps">
            <slot name="checkbox" v-bind="checkboxProps" />
          </template>
        </UFileTreeNode>
      </div>
    </div>
  </div>
</template>
