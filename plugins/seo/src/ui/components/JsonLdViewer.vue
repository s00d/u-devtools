<script setup lang="ts">
import { ref, computed } from 'vue';
import { UCodeBlock, UJsonTree, UBadge, UIcon, UButton } from '@u-devtools/ui';
import type { JsonLdItem } from '../../types';

// Import schemas
import SchemaProduct from './schemas/SchemaProduct.vue';
import SchemaArticle from './schemas/SchemaArticle.vue';
import SchemaBreadcrumb from './schemas/SchemaBreadcrumb.vue';
import SchemaWebsite from './schemas/SchemaWebsite.vue';
import SchemaFAQ from './schemas/SchemaFAQ.vue';
import SchemaGeneric from './schemas/SchemaGeneric.vue';

const props = defineProps<{
  items: JsonLdItem[];
}>();

const activeId = ref<number | null>(props.items.length > 0 ? props.items[0].id : null);
const viewModes = ref<Record<number, 'preview' | 'code'>>({}); // Store mode for each item

const toggle = (id: number) => {
  activeId.value = activeId.value === id ? null : id;
};

const setMode = (id: number, mode: 'preview' | 'code') => {
  viewModes.value[id] = mode;
};

const getMode = (id: number) => viewModes.value[id] || 'preview';

// Select component for preview
const getPreviewComponent = (type: string) => {
  if (type === 'Product') return SchemaProduct;
  if (['Article', 'NewsArticle', 'BlogPosting'].includes(type)) return SchemaArticle;
  if (type === 'BreadcrumbList') return SchemaBreadcrumb;
  if (type === 'WebSite') return SchemaWebsite;
  if (type === 'FAQPage') return SchemaFAQ;
  return SchemaGeneric; // Universal component for all other types
};

// Google Test link
const getGoogleTestUrl = (rawJson: string) => {
  return `https://search.google.com/test/rich-results?code=${encodeURIComponent(btoa(rawJson))}`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // Can add toast notification
};
</script>

<template>
  <div class="space-y-4">
    <div v-for="item in items" :key="item.id" class="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
      
      <!-- HEADER -->
      <div 
        class="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-700/50 transition-colors select-none"
        @click="toggle(item.id)"
      >
        <div class="flex items-center gap-3">
          <div class="p-1.5 bg-gray-700 rounded text-gray-300">
            <UIcon name="CodeBracketSquare" class="w-5 h-5" />
          </div>
          <div>
            <div class="font-bold text-sm text-white flex items-center gap-2">
              {{ item.type }}
              <UBadge v-if="!item.isValidJson" color="red" size="xs">Invalid</UBadge>
              <template v-else>
                <UBadge v-if="item.errors.length > 0" color="red" size="xs">Error</UBadge>
                <UBadge v-if="item.warnings.length > 0" color="yellow" size="xs">Warning</UBadge>
              </template>
            </div>
            <div class="text-xs text-gray-500 font-mono mt-0.5">ID: {{ item.id }}</div>
          </div>
        </div>
        
        <UIcon :name="activeId === item.id ? 'ChevronUp' : 'ChevronDown'" class="w-5 h-5 text-gray-500" />
      </div>

      <!-- BODY -->
      <div v-if="activeId === item.id" class="border-t border-gray-700 bg-gray-900">
        
        <!-- Toolbar -->
        <div class="flex items-center justify-between p-2 border-b border-gray-800 bg-gray-800/50">
          <!-- Mode Switcher -->
          <div class="flex bg-gray-900 rounded p-0.5 border border-gray-700">
            <button 
              @click="setMode(item.id, 'preview')"
              class="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1"
              :class="getMode(item.id) === 'preview' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'"
            >
              <UIcon name="Eye" class="w-3 h-3" /> Preview
            </button>
            <button 
              @click="setMode(item.id, 'code')"
              class="px-3 py-1 text-xs rounded transition-colors flex items-center gap-1"
              :class="getMode(item.id) === 'code' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'"
            >
              <UIcon name="CodeBracket" class="w-3 h-3" /> JSON
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <a 
              :href="getGoogleTestUrl(item.raw)" 
              target="_blank" 
              class="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-900/20"
              title="Test in Google Rich Results"
            >
              <UIcon name="ArrowTopRightOnSquare" class="w-3 h-3" /> Google Test
            </a>
            <button 
              @click="copyToClipboard(item.raw)" 
              class="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-700"
            >
              <UIcon name="Clipboard" class="w-3 h-3" /> Copy
            </button>
          </div>
        </div>

        <div class="p-4">
          <!-- Errors / Warnings -->
          <div v-if="item.errors.length || item.warnings.length" class="mb-4 space-y-2">
            <div v-for="err in item.errors" :key="err" class="flex items-start gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-900/30">
              <UIcon name="XCircle" class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{{ err }}</span>
            </div>
            <div v-for="warn in item.warnings" :key="warn" class="flex items-start gap-2 text-yellow-400 text-xs bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
              <UIcon name="ExclamationTriangle" class="w-4 h-4 shrink-0 mt-0.5" />
              <span>{{ warn }}</span>
            </div>
          </div>

          <!-- VIEW: PREVIEW -->
          <div v-if="getMode(item.id) === 'preview'">
            <div v-if="item.isValidJson">
              <component 
                :is="getPreviewComponent(item.type)" 
                :data="item.data" 
              />
              <!-- Button to switch to JSON -->
              <div class="mt-2 text-right">
                <UButton size="xs" variant="ghost" @click="setMode(item.id, 'code')">View Raw JSON</UButton>
              </div>
            </div>
            <div v-else class="text-red-400 text-sm">
              Cannot preview invalid JSON. Switch to Code view to fix.
            </div>
          </div>

          <!-- VIEW: CODE -->
          <div v-else>
            <div v-if="item.isValidJson">
              <UJsonTree :data="item.data" />
            </div>
            <div v-else>
              <UCodeBlock language="json" :code="item.raw" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
