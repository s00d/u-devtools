<script setup lang="ts">
import { ref } from 'vue';
import UIcon from './UIcon.vue';
import UTreeViewNode from './UTreeViewNode.vue';

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  data?: Record<string, unknown>; // Дополнительные данные для кастомного рендеринга
  isExpanded?: boolean;
  isSelected?: boolean;
  isCurrent?: boolean;
  icon?: string;
  [key: string]: unknown; // Для гибкости
}

const props = withDefaults(
  defineProps<{
    nodes: TreeNode[];
    title?: string;
    showHeader?: boolean;
    expandAll?: boolean;
    selectable?: boolean;
    indentSize?: number;
  }>(),
  {
    showHeader: true,
    expandAll: false,
    selectable: true,
    indentSize: 20,
  }
);

const emit = defineEmits<{
  nodeClick: [node: TreeNode];
  nodeSelect: [node: TreeNode];
  nodeExpand: [node: TreeNode, expanded: boolean];
}>();

// Внутреннее состояние раскрытия узлов
const expandedNodes = ref<Set<string | number>>(new Set());

// Инициализация: раскрываем все, если expandAll
if (props.expandAll) {
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
  if (node.children && node.children.length > 0) {
    toggleExpand(node, event);
  }
  emit('nodeClick', node);
  if (props.selectable) {
    emit('nodeSelect', node);
  }
};
</script>

<template>
  <div 
    class="h-full flex flex-col border-r select-none bg-zinc-800/30 border-zinc-800"
  >
    <!-- Header -->
    <div 
      v-if="showHeader && title"
      class="px-3 py-2 text-[10px] uppercase font-bold flex-none border-b bg-zinc-800/50 backdrop-blur-xl border-zinc-800 text-gray-400"
    >
      {{ title }}
    </div>

    <!-- Tree Content -->
    <div class="flex-1 overflow-auto p-3 select-none">
      <div class="space-y-0.5">
        <template v-for="node in nodes" :key="node.id">
          <slot name="node" :node="node" :depth="0" :is-expanded="isNodeExpanded(node)" :toggle-expand="toggleExpand" :handle-click="handleNodeClick">
            <!-- Default node renderer -->
            <div
              class="rounded transition-colors cursor-pointer"
              :class="node.isCurrent || node.isSelected 
                ? 'ring-1 ring-indigo-500/50 bg-indigo-500/15' 
                : 'hover:bg-zinc-800/50'"
              @click="handleNodeClick(node, $event)"
            >
              <div class="py-1.5 px-2 flex items-center gap-2">
                <!-- Expand/Collapse Icon -->
                <UIcon
                  v-if="node.children && node.children.length > 0"
                  :name="isNodeExpanded(node) ? 'ChevronDown' : 'ChevronRight'"
                  class="w-3 h-3 flex-shrink-0 text-gray-400"
                  @click.stop="toggleExpand(node, $event)"
                />
                <span v-else class="w-3"></span>

                <!-- Custom Icon -->
                <UIcon
                  v-if="node.icon"
                  :name="node.icon"
                  class="w-4 h-4 flex-shrink-0 text-gray-400"
                />

                <!-- Node Label (default slot for custom content) -->
                <slot name="label" :node="node">
                  <span class="text-sm text-gray-200">{{ node.label }}</span>
                </slot>
              </div>

              <!-- Children (recursive) -->
              <div
                v-if="node.children && node.children.length > 0 && isNodeExpanded(node)"
                class="pl-4 border-l ml-2 mb-1 space-y-0.5 border-zinc-900"
              >
                <UTreeViewNode
                  v-for="child in node.children"
                  :key="child.id"
                  :node="child"
                  :depth="1"
                  :is-expanded="isNodeExpanded"
                  :toggle-expand="toggleExpand"
                  :handle-click="handleNodeClick"
                  @node-click="emit('nodeClick', $event)"
                  @node-select="emit('nodeSelect', $event)"
                  @node-expand="(node, expanded) => emit('nodeExpand', node, expanded)"
                >
                  <template #label="slotProps">
                    <slot name="label" v-bind="slotProps" />
                  </template>
                </UTreeViewNode>
              </div>
            </div>
          </slot>
        </template>
      </div>
    </div>
  </div>
</template>

