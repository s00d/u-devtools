<script setup lang="ts">
import UIcon from './UIcon.vue';
import type { TreeNode } from './UTreeView.vue';

defineProps<{
  node: TreeNode;
  depth: number;
  isExpanded: (node: TreeNode) => boolean;
  toggleExpand: (node: TreeNode, event: MouseEvent) => void;
  handleClick: (node: TreeNode, event: MouseEvent) => void;
}>();

defineEmits<{
  nodeClick: [node: TreeNode];
  nodeSelect: [node: TreeNode];
  nodeExpand: [node: TreeNode, expanded: boolean];
}>();

defineSlots<{
  label(props: { node: TreeNode }): unknown;
}>();
</script>

<template>
  <div
    class="px-2 py-1 rounded cursor-pointer transition-colors"
    :class="node.isCurrent || node.isSelected 
      ? 'ring-1 ring-indigo-500/50 bg-indigo-500/15' 
      : 'hover:bg-zinc-800/50'"
    @click="handleClick(node, $event)"
  >
    <div class="flex items-center gap-2">
      <UIcon
        v-if="node.children && node.children.length > 0"
        :name="isExpanded(node) ? 'ChevronDown' : 'ChevronRight'"
        class="w-3 h-3 flex-shrink-0 text-gray-400"
        @click.stop="toggleExpand(node, $event)"
      />
      <span v-else class="w-3"></span>
      <UIcon
        v-if="node.icon"
        :name="node.icon"
        class="w-4 h-4 flex-shrink-0 text-gray-400"
      />
      <slot name="label" :node="node">
        <span class="text-sm text-gray-200">{{ node.label }}</span>
      </slot>
    </div>
    
    <!-- Nested children (recursive) -->
    <div
      v-if="node.children && node.children.length > 0 && isExpanded(node)"
      class="pl-4 border-l ml-2 mt-1 space-y-0.5 border-zinc-900"
    >
      <UTreeViewNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :is-expanded="isExpanded"
        :toggle-expand="toggleExpand"
        :handle-click="handleClick"
        @node-click="$emit('nodeClick', $event)"
        @node-select="$emit('nodeSelect', $event)"
        @node-expand="(node, expanded) => $emit('nodeExpand', node, expanded)"
      >
        <template #label="slotProps">
          <slot name="label" v-bind="slotProps" />
        </template>
      </UTreeViewNode>
    </div>
  </div>
</template>

