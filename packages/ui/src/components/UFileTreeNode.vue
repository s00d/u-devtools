<script setup lang="ts">
import { computed } from 'vue';
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';
import type { TreeNode } from '../types';

const props = withDefaults(
  defineProps<{
    node: TreeNode;
    isExpanded: (node: TreeNode) => boolean;
    isSelected: (node: TreeNode) => boolean;
    isFileNode: (node: TreeNode) => boolean;
    toggleExpand: (node: TreeNode, event: MouseEvent) => void;
    handleClick: (node: TreeNode, event: MouseEvent) => void;
    isLast?: boolean;
    depth?: number;
  }>(),
  {
    isLast: false,
    depth: 0,
  }
);

defineSlots<{
  label(props: { node: TreeNode }): unknown;
  checkbox(props: { node: TreeNode; isSelected: boolean }): unknown;
}>();

const nodeIsExpanded = computed(() => props.isExpanded(props.node));
const nodeIsSelected = computed(() => props.isSelected(props.node));
const nodeIsFile = computed(() => props.isFileNode(props.node));

const fileTreeNode = tv({
  base: 'group relative py-1.5 px-2.5 my-0.5 cursor-pointer flex items-center text-sm rounded-md transition-all duration-200 ease-out',
  variants: {
    selected: {
      true: 'bg-gradient-to-r from-indigo-500/20 via-indigo-500/15 to-transparent border-l-2 border-indigo-400 text-indigo-200 font-medium shadow-[inset_0_1px_0_0_rgba(129,140,248,0.1)]',
      false: 'border-l-2 border-transparent hover:bg-zinc-700/40 hover:border-l-indigo-500/30 hover:text-gray-200 text-gray-400 active:bg-zinc-700/50',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

const fileTreeChildren = tv({
  base: 'relative pl-5 ml-1.5 mb-0.5 space-y-0',
});

const treeLine = tv({
  base: 'absolute left-0 top-0 w-[1px] bg-zinc-700/60',
  variants: {
    isLast: {
      true: 'h-[0.875rem]',
      false: 'bottom-0',
    },
  },
  defaultVariants: {
    isLast: false,
  },
});

const treeLineHorizontal = tv({
  base: 'absolute left-0 top-[0.875rem] w-3 h-[1px] bg-zinc-700/60',
});
</script>

<template>
  <div class="relative">
    <!-- Horizontal line for child elements -->
    <div
      v-if="depth > 0"
      :class="treeLineHorizontal()"
    />
    
    <div
      :class="fileTreeNode({ selected: nodeIsSelected })"
      @click="handleClick(node, $event)"
    >
      <UIcon
        v-if="node.children && node.children.length > 0"
        :name="nodeIsExpanded ? 'ChevronDown' : 'ChevronRight'"
        class="w-3.5 h-3.5 mr-2.5 text-gray-500 flex-shrink-0 transition-transform duration-200 group-hover:text-indigo-400"
        :class="nodeIsExpanded ? 'rotate-0' : '-rotate-90'"
        @click.stop="toggleExpand(node, $event)"
      />
      <!-- Checkbox slot (before icon) -->
      <slot name="checkbox" :node="node" :is-selected="nodeIsSelected">
        <!-- Default: no checkbox -->
      </slot>
      <UIcon
        :name="node.icon || (nodeIsFile ? 'DocumentText' : (nodeIsExpanded ? 'FolderOpen' : 'Folder'))"
        class="w-4 h-4 mr-2.5 flex-shrink-0 transition-all duration-200"
        :class="nodeIsFile 
          ? 'text-blue-400/90 group-hover:text-blue-300' 
          : 'text-amber-500/90 group-hover:text-amber-400'"
      />
      <slot name="label" :node="node">
        <span 
          class="truncate transition-colors duration-200"
          :class="nodeIsSelected 
            ? 'text-indigo-200 font-medium' 
            : 'text-gray-400 group-hover:text-gray-200'"
        >
          {{ node.label }}
        </span>
      </slot>
    </div>
    
    <!-- Recursively render child elements -->
    <div
      v-if="node.children && node.children.length > 0 && nodeIsExpanded"
      :class="fileTreeChildren()"
    >
      <!-- Vertical line for child element group -->
      <div :class="treeLine({ isLast: false })" />
      
        <UFileTreeNode
          v-for="(child, index) in node.children"
          :key="child.id"
          :node="child"
          :is-expanded="isExpanded"
          :is-selected="isSelected"
          :is-file-node="isFileNode"
          :toggle-expand="toggleExpand"
          :handle-click="handleClick"
          :is-last="index === node.children.length - 1"
          :depth="depth + 1"
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
</template>
