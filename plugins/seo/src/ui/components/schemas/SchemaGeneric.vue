<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{ data: any }>();

// Heuristic to find title
const title = computed(
  () =>
    props.data.name ||
    props.data.headline ||
    props.data.title ||
    props.data.legalName ||
    props.data['@type']
);

// Heuristic to find description
const description = computed(
  () => props.data.description || props.data.articleBody || props.data.text || props.data.about
);

// Heuristic to find image
const image = computed(() => {
  const img = props.data.image || props.data.logo || props.data.photo;
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return img[0];
  if (typeof img === 'object') return img.url;
  return null;
});

// Remaining fields for table (excluding already shown and system fields)
const extraFields = computed(() => {
  const ignored = [
    '@context',
    '@type',
    'name',
    'headline',
    'title',
    'legalName',
    'description',
    'articleBody',
    'text',
    'about',
    'image',
    'logo',
    'photo',
  ];
  return Object.entries(props.data).filter(([key, val]) => {
    return !ignored.includes(key) && typeof val !== 'object' && val !== null;
  });
});
</script>

<template>
  <div class="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
    <!-- Generic Header Card -->
    <div class="p-4 flex gap-4 bg-gray-800/50">
      <!-- Image if exists -->
      <div v-if="image" class="w-20 h-20 bg-white rounded border border-gray-600 shrink-0 overflow-hidden flex items-center justify-center">
        <img :src="image" class="w-full h-full object-contain" />
      </div>
      <div v-else class="w-20 h-20 bg-gray-700 rounded border border-gray-600 shrink-0 flex items-center justify-center text-gray-500">
        <UIcon name="Photo" class="w-8 h-8" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="text-xs text-indigo-400 font-bold uppercase mb-1">{{ data['@type'] }}</div>
        <div class="text-lg font-bold text-white leading-tight mb-1 truncate">{{ title }}</div>
        <div class="text-sm text-gray-400 line-clamp-2" v-if="description">{{ description }}</div>
        <div class="text-sm text-gray-500 italic" v-else>No description</div>
      </div>
    </div>

    <!-- Properties Table -->
    <div class="border-t border-gray-700 bg-gray-900/30 p-4" v-if="extraFields.length > 0">
      <div class="grid grid-cols-1 gap-y-1">
        <div v-for="([key, val]) in extraFields" :key="key" class="flex gap-2 text-sm border-b border-gray-800/50 pb-1 last:border-0 last:pb-0">
          <span class="text-gray-500 w-1/3 truncate text-xs font-mono pt-0.5">{{ key }}</span>
          <span class="text-gray-300 flex-1 break-all">{{ val }}</span>
        </div>
      </div>
    </div>
    
    <div class="bg-blue-900/10 border-t border-blue-900/20 p-2 text-center">
      <span class="text-xs text-blue-400">Generic visualization for unknown schema type</span>
    </div>
  </div>
</template>

