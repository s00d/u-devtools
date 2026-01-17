<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { UButton, UInput, UIcon } from '@u-devtools/ui';
import { useBridge, useApi } from '../context';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue';
import type { LibraryProtocol } from '../types';
import { DEFAULT_COMPONENTS } from '../data/default-ui';
import SnippetCard from './components/SnippetCard.vue';
import SaveModal from './components/SaveModal.vue';
import { transformCode } from '../utils/transformer';
import type { ComponentSnippet } from '../types';

const bridge = useBridge();
const api = useApi();

const customSnippets = ref<ComponentSnippet[]>([]);
const activeTab = ref('All');
const searchQuery = ref('');
// Используем bridge.state() для синхронизации
const isInspecting = useSyncedRef(bridge.state('isInspecting', false));
const showSaveModal = ref(false);
const saveModalHtml = ref('');

// Combined List
const allSnippets = computed(() => [...DEFAULT_COMPONENTS, ...customSnippets.value]);

// Filtered List
const filteredSnippets = computed(() => {
  return allSnippets.value.filter((s) => {
    const matchesTab =
      activeTab.value === 'All' ||
      s.category === activeTab.value ||
      (activeTab.value === 'Custom' && s.isCustom);
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    return matchesTab && matchesSearch;
  });
});

const categories = computed(() => {
  const cats = new Set(allSnippets.value.map((s) => s.category));
  return ['All', ...Array.from(cats), 'Custom'];
});

// Load Custom
const loadCustom = async () => {
  try {
    const res = await api.rpc.call<ComponentSnippet[]>('library:get-custom');
    customSnippets.value = res.map((s) => ({ ...s, isCustom: true }));
  } catch (e) {
    console.error('[Library] Error loading custom snippets:', e);
  }
};

// Actions
const copyCode = async (snippet: ComponentSnippet, format: 'jsx' | 'vue' | 'html') => {
  try {
    const code = transformCode(snippet.html, format);
    await api.clipboard.copy(code, `Copied as ${format.toUpperCase()}`);
  } catch (e) {
    console.error('[Library] Error copying code:', e);
  }
};

const deleteCustom = async (id: string) => {
  if (!confirm('Delete this snippet?')) return;
  try {
    await api.rpc.call('library:delete', id);
    await loadCustom();
  } catch (e) {
    console.error('[Library] Error deleting snippet:', e);
  }
};

// Pick Element from Page
const handlePickElement = () => {
  isInspecting.value = !isInspecting.value;
};

const handleSave = async (snippet: ComponentSnippet) => {
  try {
    await api.rpc.call('library:save', snippet);
    await loadCustom();
    showSaveModal.value = false;
    saveModalHtml.value = '';
    api.notify('Component saved!', 'success');
  } catch (e) {
    console.error('[Library] Error saving snippet:', e);
  }
};

// Listen for selected HTML from app context
const handleSelectedHtml = ({ html }: { html: string }) => {
  saveModalHtml.value = html;
  showSaveModal.value = true;
};

const handleClosePopup = () => {
  isInspecting.value = false;
};

const handleOutsideClick = () => {
  isInspecting.value = false;
};

onMounted(() => {
  loadCustom();

  bridge.on('element-selected', ({ html }) => {
    saveModalHtml.value = html;
    showSaveModal.value = true;
    // isInspecting автоматически выключится через bridge.state()
  });
});

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
});
</script>

<template>
  <div class="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4] font-sans text-xs">
    <!-- Header -->
    <div class="p-3 border-b border-[#333] bg-[#252526] flex justify-between gap-4 items-center">
      <div class="flex items-center gap-2 font-bold text-white">
        <UIcon name="Swatch" class="w-5 h-5 text-indigo-400" />
        UI Library
      </div>
      <div class="flex gap-2 items-center">
        <UInput
          v-model="searchQuery"
          placeholder="Search components..."
          size="sm"
          class="w-64"
          icon="MagnifyingGlass"
        />
        <UButton 
          size="xs" 
          variant="ghost" 
          icon="CursorArrowRays" 
          @click="handlePickElement" 
          title="Pick element from page"
          :class="{ 'bg-indigo-600 text-white': isInspecting }"
        >
          Pick Element
        </UButton>
      </div>
    </div>

    <!-- Tabs -->
    <div class="px-2 pt-2 bg-[#1e1e1e] border-b border-[#333] overflow-x-auto">
      <div class="flex gap-1">
        <button
          v-for="cat in categories"
          :key="cat"
          @click="activeTab = cat || 'All'"
          class="px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap"
          :class="
            activeTab === cat
              ? 'bg-[#252526] text-white border-b-2 border-indigo-500'
              : 'text-gray-500 hover:text-gray-300'
          "
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div class="flex-1 overflow-y-auto p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SnippetCard
          v-for="snippet in filteredSnippets"
          :key="snippet.id"
          :snippet="snippet"
          @copy="(fmt) => copyCode(snippet, fmt)"
          @delete="deleteCustom(snippet.id)"
        />
      </div>

      <!-- Inspector Active Indicator -->
      <div
        v-if="isInspecting"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
        @click.self="handleOutsideClick"
      >
        <div class="bg-[#252526] p-6 rounded-xl shadow-2xl text-center border border-indigo-500 pointer-events-auto relative">
          <button
            @click="handleClosePopup"
            class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded transition-colors"
          >
            <UIcon name="XMark" class="w-5 h-5" />
          </button>
          <UIcon name="CursorArrowRays" class="w-12 h-12 mx-auto text-indigo-400 mb-4 animate-bounce" />
          <h3 class="text-xl font-bold text-white mb-2">Pick an element</h3>
          <p class="text-gray-400">Hover and click on any element to save it to library.</p>
          <p class="text-xs text-gray-500 mt-4">Press ESC to cancel</p>
        </div>
      </div>
    </div>

    <!-- Save Modal -->
    <SaveModal v-model:show="showSaveModal" :html="saveModalHtml" @save="handleSave" />
  </div>
</template>

