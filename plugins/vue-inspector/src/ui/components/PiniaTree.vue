<script setup lang="ts">
import { computed, defineComponent, type PropType } from 'vue';
import type { CustomInspectorNode } from '../../types';
import { UIcon, UBadge, UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  tree: CustomInspectorNode[];
  selectedId?: string;
  expandedNodes: Set<string>;
}>();

const emit = defineEmits<{
  (event: 'select', node: CustomInspectorNode): void;
  (event: 'toggle-expanded', nodeId: string): void;
}>();

const PiniaTreeNode = defineComponent({
  name: 'PiniaTreeNode',
  props: {
    node: { type: Object as PropType<CustomInspectorNode>, required: true },
    depth: { type: Number, default: 0 },
    selectedId: { type: String },
    expandedNodes: { type: Object as PropType<Set<string>>, required: true },
  },
  emits: ['select', 'toggle-expanded'],
  setup(props) {
    const isSelected = computed(() => props.selectedId === props.node.id);
    const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
    const isExpanded = computed(() => props.expandedNodes.has(props.node.id));

    return {
      isSelected,
      hasChildren,
      isExpanded,
    };
  },
  template: `
    <div class="flex flex-col">
      <div
        class="flex items-center gap-2 py-1 px-2 rounded-md cursor-pointer transition-colors"
        :style="{ paddingLeft: depth * 16 + 'px' }"
        :class="{
          'bg-indigo-900/30 text-indigo-300': isSelected,
          'hover:bg-gray-800': !isSelected,
        }"
        @click="$emit('select', node)"
      >
        <button
          v-if="hasChildren"
          @click.stop="$emit('toggle-expanded', node.id)"
          class="w-4 h-4 flex items-center justify-center hover:bg-gray-700 rounded"
        >
          <UIcon
            name="ChevronRight"
            class="w-3 h-3 text-gray-500 transition-transform"
            :class="{ 'rotate-90': isExpanded }"
          />
        </button>
        <div v-else class="w-4 h-4" />
        <span class="font-mono text-sm">{{ node.label }}</span>
        <div class="flex gap-1 ml-auto">
          <UBadge
            v-for="tag in (node.tags || [])"
            :key="tag.label"
            size="xs"
            color="blue"
          >
            {{ tag.label }}
          </UBadge>
        </div>
      </div>
      <div v-if="hasChildren && isExpanded" class="pl-2">
        <PiniaTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          :selected-id="selectedId"
          :expanded-nodes="expandedNodes"
          @select="$emit('select', $event)"
          @toggle-expanded="$emit('toggle-expanded', $event)"
        />
      </div>
    </div>
  `,
});
</script>

<template>
  <div class="h-full overflow-auto bg-gray-900">
    <div v-if="tree.length === 0" class="flex items-center justify-center h-full p-8">
      <UEmpty
        icon="Cube"
        title="No Pinia stores found"
        description="Pinia stores will appear here when they are created"
      />
    </div>
    <div v-else class="p-2">
      <PiniaTreeNode
        v-for="node in tree"
        :key="node.id"
        :node="node"
        :depth="0"
        :selected-id="selectedId"
        :expanded-nodes="expandedNodes"
        @select="emit('select', $event)"
        @toggle-expanded="emit('toggle-expanded', $event)"
      />
    </div>
  </div>
</template>
