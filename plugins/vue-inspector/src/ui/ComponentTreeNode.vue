<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ComponentTreeNode } from '../types';
import { UIcon, UBadge } from '@u-devtools/ui';

const props = defineProps<{
  node: ComponentTreeNode;
  depth?: number;
  selectedId?: string;
}>();

const emit = defineEmits<{
  select: [node: ComponentTreeNode];
  hover: [node: ComponentTreeNode];
  leave: [];
}>();

const isExpanded = ref(true);
const hasChildren = computed(() => props.node.children && props.node.children.length > 0);
const isSelected = computed(() => props.selectedId === props.node.id);
const paddingLeft = computed(() => `${(props.depth || 0) * 16 + 8}px`);

const toggleExpand = () => {
  if (hasChildren.value) {
    isExpanded.value = !isExpanded.value;
  }
};

const handleClick = () => {
  emit('select', props.node);
};

const handleHover = () => {
  emit('hover', props.node);
};
</script>

<template>
  <div>
    <div
      :class="[
        'flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded hover:bg-gray-800 transition-colors text-sm',
        isSelected && 'bg-indigo-900/30 text-indigo-300'
      ]"
      :style="{ paddingLeft }"
      @click="handleClick"
      @mouseenter="handleHover"
      @mouseleave="$emit('leave')"
    >
      <button
        v-if="hasChildren"
        @click.stop="toggleExpand"
        class="shrink-0 w-3 h-3 flex items-center justify-center"
      >
        <UIcon 
          :name="isExpanded ? 'ChevronDown' : 'ChevronRight'" 
          class="w-3 h-3 text-gray-400" 
        />
      </button>
      <div v-else class="w-3 shrink-0" />
      <span class="font-mono flex-1 truncate">{{ node.name }}</span>
      <div v-if="node.tags && node.tags.length > 0" class="flex gap-1 ml-auto shrink-0">
        <UBadge 
          v-for="(tag, idx) in node.tags" 
          :key="`${node.id}-tag-${idx}`"
          size="xs" 
          color="gray"
        >
          {{ typeof tag === 'string' ? tag : tag.label }}
        </UBadge>
      </div>
      <UBadge v-if="node.isFragment" size="xs" color="blue" class="ml-1 shrink-0">
        fragment
      </UBadge>
      <UBadge v-if="node.inactive" size="xs" color="yellow" class="ml-1 shrink-0">
        inactive
      </UBadge>
    </div>
    <div v-if="hasChildren && isExpanded" class="ml-0">
      <ComponentTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="(depth || 0) + 1"
        :selected-id="selectedId"
        @select="$emit('select', $event)"
        @hover="$emit('hover', $event)"
        @leave="$emit('leave')"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

