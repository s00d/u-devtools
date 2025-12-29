<script setup lang="ts">
import DomNode from './DomNode.vue';

interface DomContext {
  parent: { tagName: string; id: string; classes: string[]; hasChildren: boolean } | null;
  siblings: Array<{ tagName: string; id: string; classes: string[]; hasChildren: boolean; isCurrent: boolean; index: number }>;
  children: Array<{ tagName: string; id: string; classes: string[]; hasChildren: boolean; index: number }>;
}

defineProps<{
  domContext?: DomContext;
}>();

const emit = defineEmits<{
  (e: 'select-node', payload: { type: 'parent' | 'sibling' | 'child'; index?: number }): void;
}>();
</script>

<template>
  <div class="h-full flex flex-col bg-[#0d1117] border-r border-gray-800 select-none">
    <div class="px-3 py-2 text-[10px] uppercase font-bold text-gray-400 bg-gray-800 border-b border-gray-800 flex-none">
      DOM Context
    </div>
    <div class="flex-1 overflow-auto p-3 select-none">
      <!-- Parent -->
      <div 
        v-if="domContext?.parent" 
        @click="emit('select-node', { type: 'parent' })" 
        class="opacity-60 hover:opacity-100 mb-1 transition-opacity cursor-pointer"
      >
        <DomNode 
          :tagName="domContext.parent.tagName"
          :id="domContext.parent.id"
          :classes="domContext.parent.classes"
          :hasChildren="domContext.parent.hasChildren"
        />
      </div>
      
      <!-- Siblings & Self -->
      <div class="pl-4 border-l border-gray-800 ml-1 space-y-0.5">
        <div 
          v-for="node in domContext?.siblings" 
          :key="node.index"
          @click="!node.isCurrent && emit('select-node', { type: 'sibling', index: node.index })"
          class="rounded transition-colors"
          :class="node.isCurrent ? 'bg-indigo-900/30 ring-1 ring-indigo-500/50' : 'hover:opacity-80 cursor-pointer hover:bg-gray-800'"
        >
          <!-- Node Line -->
          <div class="py-1.5 px-2">
            <DomNode 
              :tagName="node.tagName"
              :id="node.id"
              :classes="node.classes"
              :isCurrent="node.isCurrent"
              :hasChildren="node.hasChildren"
            />
          </div>

          <!-- CHILDREN (Visible only for current) -->
          <div 
            v-if="node.isCurrent && domContext?.children && domContext.children.length > 0" 
            class="pl-4 pb-1 space-y-0.5 border-l border-gray-700 ml-2 mb-1"
          >
            <div 
              v-for="child in domContext.children"
              :key="child.index"
              @click.stop="emit('select-node', { type: 'child', index: child.index })"
              class="px-2 py-1 hover:bg-gray-800 rounded cursor-pointer transition-colors"
            >
              <DomNode 
                :tagName="child.tagName"
                :id="child.id"
                :classes="child.classes"
                :hasChildren="child.hasChildren"
              />
            </div>
          </div>
          
          <!-- Closing Tag -->
          <div 
            v-if="node.isCurrent && domContext?.children && domContext.children.length > 0" 
            class="px-2 pb-1 text-gray-400 dark:text-gray-500 text-xs font-mono"
          >
            &lt;/{{ node.tagName }}&gt;
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

