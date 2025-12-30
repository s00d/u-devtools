<script setup lang="ts">
import { computed } from 'vue';
import { UTreeView, UDomNode, type TreeNode } from '@u-devtools/ui';

interface DomContext {
  parent: { tagName: string; id: string; classes: string[]; hasChildren: boolean } | null;
  siblings: Array<{
    tagName: string;
    id: string;
    classes: string[];
    hasChildren: boolean;
    isCurrent: boolean;
    index: number;
  }>;
  children: Array<{
    tagName: string;
    id: string;
    classes: string[];
    hasChildren: boolean;
    index: number;
  }>;
}

const props = defineProps<{
  domContext?: DomContext;
}>();

const emit =
  defineEmits<
    (e: 'select-node', payload: { type: 'parent' | 'sibling' | 'child'; index?: number }) => void
  >();

// Преобразуем DomContext в формат TreeNode для UTreeView
const treeNodes = computed<TreeNode[]>(() => {
  const nodes: TreeNode[] = [];

  // Parent node (если есть)
  if (props.domContext?.parent) {
    const parent = props.domContext.parent;
    nodes.push({
      id: 'parent',
      label: '', // Будет рендериться через слот
      data: {
        type: 'parent',
        tagName: parent.tagName,
        id: parent.id,
        classes: parent.classes,
        hasChildren: parent.hasChildren,
      },
      isExpanded: true,
    });
  }

  // Siblings (включая текущий)
  if (props.domContext?.siblings) {
    props.domContext.siblings.forEach((sibling) => {
      const node: TreeNode = {
        id: `sibling-${sibling.index}`,
        label: '', // Будет рендериться через слот
        data: {
          type: 'sibling',
          index: sibling.index,
          tagName: sibling.tagName,
          id: sibling.id,
          classes: sibling.classes,
          hasChildren: sibling.hasChildren,
          isCurrent: sibling.isCurrent,
        },
        isCurrent: sibling.isCurrent,
        isExpanded:
          sibling.isCurrent && props.domContext?.children && props.domContext.children.length > 0,
        children:
          sibling.isCurrent && props.domContext?.children && props.domContext.children.length > 0
            ? props.domContext.children.map((child) => ({
                id: `child-${child.index}`,
                label: '', // Будет рендериться через слот
                data: {
                  type: 'child',
                  index: child.index,
                  tagName: child.tagName,
                  id: child.id,
                  classes: child.classes,
                  hasChildren: child.hasChildren,
                },
              }))
            : undefined,
      };
      nodes.push(node);
    });
  }

  return nodes;
});

const handleNodeSelect = (node: TreeNode) => {
  const type = node.data?.type as 'parent' | 'sibling' | 'child';
  const index = node.data?.index as number | undefined;
  emit('select-node', { type, index });
};
</script>

<template>
  <UTreeView
    :nodes="treeNodes"
    title="DOM Context"
    :expand-all="false"
    @node-select="handleNodeSelect"
  >
    <!-- Custom node renderer for DOM elements -->
    <template #node="{ node, depth, isExpanded, handleClick }">
      <div
        v-if="node.data?.type === 'parent'"
        @click="handleClick(node, $event)"
        class="opacity-60 hover:opacity-100 mb-1 transition-opacity cursor-pointer"
      >
        <UDomNode
          :tagName="node.data.tagName as string"
          :id="node.data.id as string"
          :classes="node.data.classes as string[]"
          :hasChildren="node.data.hasChildren as boolean"
        />
      </div>
      
      <div
        v-else-if="node.data?.type === 'sibling'"
        @click="!node.isCurrent && handleClick(node, $event)"
        class="rounded transition-colors"
        :class="node.isCurrent ? 'ring-1 ring-indigo-500/50' : 'hover:opacity-80 cursor-pointer'"
        :style="node.isCurrent 
          ? { backgroundColor: 'rgba(99, 102, 241, 0.15)' }
          : {}"
        @mouseenter="(e: MouseEvent) => {
          if (!node.isCurrent && e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--udt-bg-hover)';
          }
        }"
        @mouseleave="(e: MouseEvent) => {
          if (!node.isCurrent && e.currentTarget) {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
          }
        }"
      >
        <!-- Node Line -->
        <div class="py-1.5 px-2">
          <UDomNode
            :tagName="node.data.tagName as string"
            :id="node.data.id as string"
            :classes="node.data.classes as string[]"
            :isCurrent="node.isCurrent"
            :hasChildren="node.data.hasChildren as boolean"
          />
        </div>

        <!-- CHILDREN (Visible only for current) -->
        <div
          v-if="node.isCurrent && node.children && node.children.length > 0"
          class="pl-4 pb-1 space-y-0.5 border-l ml-2 mb-1"
          :style="{ borderColor: 'var(--udt-border-subtle)' }"
        >
          <div
            v-for="child in node.children"
            :key="child.id"
            @click.stop="handleClick(child, $event)"
            class="px-2 py-1 rounded cursor-pointer transition-colors"
            @mouseenter="(e: MouseEvent) => { 
              if (e.currentTarget) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--udt-bg-hover)';
              }
            }"
            @mouseleave="(e: MouseEvent) => { 
              if (e.currentTarget) {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              }
            }"
          >
            <UDomNode
              v-if="child.data"
              :tagName="child.data.tagName as string"
              :id="child.data.id as string"
              :classes="child.data.classes as string[]"
              :hasChildren="child.data.hasChildren as boolean"
            />
          </div>
        </div>
        
        <!-- Closing Tag -->
        <div
          v-if="node.isCurrent && node.children && node.children.length > 0"
          class="px-2 pb-1 text-xs font-mono"
          :style="{ color: 'var(--udt-text-dim)' }"
        >
          &lt;/{{ node.data.tagName }}&gt;
        </div>
      </div>
    </template>
  </UTreeView>
</template>

<style scoped>
@reference "tailwindcss";
</style>

