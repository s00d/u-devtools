<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentTreeNode } from '../../types';
import { UIcon, UBadge } from '@u-devtools/ui';
import ComponentTreeNodeComponent from '../ComponentTreeNode.vue';

const props = defineProps<{
  tree: ComponentTreeNode[];
  selectedId?: string;
  expandedNodes: Set<string>;
}>();

const emit = defineEmits<{
  (event: 'select', node: ComponentTreeNode): void;
  (event: 'hover', node: ComponentTreeNode): void;
  (event: 'leave'): void;
  (event: 'toggle-expanded', nodeId: string): void;
}>();

const handleSelect = (node: ComponentTreeNode) => {
  emit('select', node);
};

const handleHover = (node: ComponentTreeNode) => {
  emit('hover', node);
};

const handleLeave = () => {
  emit('leave');
};

const handleToggleExpanded = (nodeId: string) => {
  emit('toggle-expanded', nodeId);
};
</script>

<template>
  <div class="h-full overflow-auto bg-gray-900">
    <div v-if="tree.length === 0" class="flex items-center justify-center h-full p-8">
      <div class="text-center text-gray-400">
        <UIcon name="Cube" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p class="text-sm">No components found</p>
      </div>
    </div>
    <div v-else class="p-2">
      <ComponentTreeNodeComponent
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :selected-id="selectedId"
        :expanded="expandedNodes.has(node.id)"
        @select="handleSelect"
        @hover="handleHover"
        @leave="handleLeave"
        @toggle-expanded="handleToggleExpanded"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

