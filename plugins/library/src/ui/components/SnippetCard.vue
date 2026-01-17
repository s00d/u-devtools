<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UIcon } from '@u-devtools/ui';
import type { ComponentSnippet } from '../../types';

const props = defineProps<{ snippet: ComponentSnippet }>();
const emit = defineEmits<{
  copy: [format: 'html' | 'jsx' | 'vue'];
  delete: [id: string];
}>();

const previewRoot = ref<HTMLElement | null>(null);
let shadowRoot: ShadowRoot | null = null;

onMounted(() => {
  if (previewRoot.value) {
    shadowRoot = previewRoot.value.attachShadow({ mode: 'open' });

    // Inject Tailwind styles and component HTML
    shadowRoot.innerHTML = `
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css" rel="stylesheet">
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        body {
          margin: 0;
          padding: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100%;
        }
      </style>
      <div style="padding: 1rem; display: flex; justify-content: center; align-items: center; min-height: 100%;">
        ${props.snippet.html}
      </div>
    `;
  }
});

onUnmounted(() => {
  shadowRoot = null;
});
</script>

<template>
  <div
    class="bg-[#1e1e1e] rounded-lg border border-[#333] flex flex-col overflow-hidden group hover:border-indigo-500 transition-colors"
  >
    <!-- Preview Window -->
    <div class="h-32 bg-[#252526] relative overflow-hidden" ref="previewRoot">
      <!-- Shadow DOM content goes here -->
    </div>

    <!-- Info & Actions -->
    <div class="p-3 border-t border-[#333] bg-[#1e1e1e]">
      <div class="flex justify-between items-start mb-2">
        <div>
          <h4 class="font-bold text-sm text-white">{{ snippet.name }}</h4>
          <span class="text-[10px] text-gray-500 uppercase tracking-wider">{{ snippet.category }}</span>
        </div>
        <button
          v-if="snippet.isCustom"
          @click="emit('delete', snippet.id)"
          class="text-gray-600 hover:text-red-400 transition-colors"
          title="Delete snippet"
        >
          <UIcon name="Trash" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex gap-2 mt-2">
        <div class="flex bg-[#2d2d2d] rounded p-0.5 border border-[#444] flex-1">
          <button
            @click="emit('copy', 'html')"
            class="px-2 text-[10px] hover:text-white text-gray-400 font-bold transition-colors"
            title="Copy as HTML"
          >
            HTML
          </button>
          <button
            @click="emit('copy', 'jsx')"
            class="px-2 text-[10px] hover:text-white text-gray-400 font-bold border-l border-[#444] transition-colors"
            title="Copy as JSX"
          >
            JSX
          </button>
          <button
            @click="emit('copy', 'vue')"
            class="px-2 text-[10px] hover:text-white text-gray-400 font-bold border-l border-[#444] transition-colors"
            title="Copy as Vue"
          >
            Vue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

