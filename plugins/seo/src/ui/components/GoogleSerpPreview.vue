<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';
import type { SeoTags } from '../../types';

const props = defineProps<{
  data: SeoTags;
  mode?: 'Desktop' | 'Mobile';
}>();

const mode = computed(() => props.mode || 'Desktop');

const title = computed(() => props.data.title || 'Page Title');
const desc = computed(() => props.data.description || 'Page meta description...');
const url = computed(() => props.data.canonical || props.data.ogUrl || 'https://example.com/page');

const displayUrl = computed(() => {
  try {
    const u = new URL(url.value);
    const path =
      u.pathname === '/' ? '' : ' › ' + u.pathname.split('/').filter(Boolean).join(' › ');
    return `${u.hostname}${path}`;
  } catch {
    return url.value;
  }
});

// Width limits (in pixels, approximate)
const titleLimit = computed(() => (mode.value === 'Desktop' ? 600 : 580)); // ~60 chars for Desktop, ~50 for Mobile
</script>

<template>
  <div class="bg-white p-6 rounded-lg border border-gray-200 text-[#4d5156] font-sans">
    <!-- PREVIEW CONTAINER -->
    <div :class="mode === 'Mobile' ? 'max-w-[375px] mx-auto border-x px-4 py-4 min-h-[300px]' : 'max-w-[600px]'">
      
      <!-- Result Item -->
      <div class="mb-4">
        <!-- Favicon + Site Name -->
        <div class="flex items-center gap-3 mb-1.5 group cursor-pointer">
          <div class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
            <img v-if="data.favicon" :src="data.favicon" class="w-4 h-4 object-contain" />
            <UIcon v-else name="GlobeAlt" class="w-4 h-4 text-gray-500" />
          </div>
          <div class="flex flex-col leading-snug min-w-0 flex-1">
            <span class="text-sm text-[#202124] group-hover:underline truncate">{{ data.ogSiteName || displayUrl.split(' › ')[0] }}</span>
            <span class="text-xs text-[#4d5156] truncate">{{ displayUrl }}</span>
          </div>
          <div class="ml-auto shrink-0">
            <UIcon name="EllipsisVertical" class="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <!-- Title -->
        <h3 
          class="text-[#1a0dab] hover:underline cursor-pointer leading-snug mb-1"
          :style="{ 
            fontSize: mode === 'Mobile' ? '18px' : '20px',
            maxWidth: titleLimit + 'px'
          }"
          :class="mode === 'Mobile' ? 'line-clamp-2' : 'line-clamp-1'"
        >
          {{ title }}
        </h3>

        <!-- Description -->
        <div 
          class="text-sm text-[#4d5156] leading-normal"
          :class="mode === 'Mobile' ? 'line-clamp-3' : 'line-clamp-2'"
        >
          <span class="text-[#70757a]" v-if="data.jsonLd && data.jsonLd.some(j => j.type.includes('Article'))">
            {{ new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }} — 
          </span>
          {{ desc }}
        </div>

        <!-- Rich Snippets (Ratings, if Product schema) -->
        <div v-if="data.jsonLd && data.jsonLd.some(j => j.type === 'Product' && j.data.aggregateRating)" class="mt-2 flex items-center gap-2">
          <div class="flex text-[#fbbc04]">
            <UIcon 
              v-for="i in 5" 
              :key="i" 
              name="Star" 
              :solid="i <= Math.round(data.jsonLd.find(j => j.type === 'Product')?.data.aggregateRating?.ratingValue || 0)"
              class="w-4 h-4" 
            />
          </div>
          <span class="text-sm text-[#202124]">
            {{ data.jsonLd.find(j => j.type === 'Product')?.data.aggregateRating?.ratingValue }}
          </span>
          <span class="text-sm text-[#70757a]">
            ({{ data.jsonLd.find(j => j.type === 'Product')?.data.aggregateRating?.reviewCount }} reviews)
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

