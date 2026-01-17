<script setup lang="ts">
import { computed } from 'vue';
import { UIcon, UInput } from '@u-devtools/ui';

const props = defineProps<{ data: any }>();

const name = computed(() => props.data.name || props.data.alternateName || 'Website Name');
const url = computed(() => props.data.url || 'https://example.com');
const description = computed(
  () => props.data.description || 'No description provided for this website.'
);

// Check for SearchAction (search box in results)
const hasSearch = computed(() => {
  if (!props.data.potentialAction) return false;
  const actions = Array.isArray(props.data.potentialAction)
    ? props.data.potentialAction
    : [props.data.potentialAction];
  return actions.some((a: any) => a['@type'] === 'SearchAction');
});
</script>

<template>
  <div class="font-sans max-w-[600px] bg-white p-4 rounded border border-gray-200 text-[#4d5156]">
    <!-- Header -->
    <div class="flex items-center gap-2 mb-1">
      <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
        <UIcon name="GlobeAlt" class="w-4 h-4 text-gray-500" />
      </div>
      <div class="flex flex-col">
        <span class="text-sm text-[#202124]">{{ name }}</span>
        <span class="text-xs text-[#5f6368]">{{ url }}</span>
      </div>
    </div>

    <!-- Title -->
    <div class="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1">
      {{ name }}
    </div>

    <!-- Description -->
    <div class="text-sm text-[#4d5156] mb-3">
      {{ description }}
    </div>

    <!-- Sitelinks Search Box Preview -->
    <div v-if="hasSearch" class="border border-gray-300 rounded shadow-sm p-0 overflow-hidden max-w-[400px] relative">
      <div class="absolute right-3 top-2.5 text-blue-600">
        <UIcon name="MagnifyingGlass" class="w-5 h-5" />
      </div>
      <input 
        type="text" 
        disabled 
        placeholder="Search within this site..." 
        class="w-full px-4 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
      />
    </div>
    <div v-else class="text-xs text-orange-400 mt-2 flex items-center gap-1">
      <UIcon name="InformationCircle" class="w-3 h-3" /> No Sitelinks Search Box configured
    </div>
  </div>
</template>

