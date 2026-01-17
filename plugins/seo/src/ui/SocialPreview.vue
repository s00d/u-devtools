<script setup lang="ts">
import { computed } from 'vue';
import type { SeoTags } from '../types';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  type: 'google' | 'facebook' | 'twitter' | 'telegram' | 'linkedin';
  data: SeoTags;
  mode?: 'Desktop' | 'Mobile';
}>();

const isMobile = computed(() => props.mode === 'Mobile');

// Fallback logic
const title = computed(() => {
  if (props.type === 'twitter')
    return props.data.twitterTitle || props.data.ogTitle || props.data.title;
  return props.data.ogTitle || props.data.title;
});

const description = computed(() => {
  if (props.type === 'twitter')
    return props.data.twitterDescription || props.data.ogDescription || props.data.description;
  return props.data.ogDescription || props.data.description;
});

const image = computed(() => {
  if (props.type === 'twitter') return props.data.twitterImage || props.data.ogImage;
  return props.data.ogImage;
});

const url = computed(() => {
  const u = props.data.ogUrl || props.data.canonical || 'example.com/page';
  try {
    return new URL(u).hostname;
  } catch {
    return u;
  }
});
</script>

<template>
  <div class="select-none">
    <!-- GOOGLE SEARCH -->
    <div
      v-if="type === 'google'"
      class="font-sans bg-white p-4 rounded-lg shadow-sm max-w-[600px] border border-gray-200"
    >
      <div class="flex items-center gap-2 mb-1">
        <div
          class="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] text-gray-500 overflow-hidden"
        >
          <img v-if="image" :src="image" class="w-full h-full object-cover opacity-80" />
          <UIcon v-else name="GlobeAlt" class="w-4 h-4" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm text-[#202124]">{{ props.data.ogSiteName || url }}</span>
          <span class="text-xs text-[#5f6368]">{{
            props.data.ogUrl || 'https://example.com'
          }}</span>
        </div>
      </div>
      <div
        class="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1"
      >
        {{ title || 'No Title Provided' }}
      </div>
      <div class="text-sm text-[#4d5156] line-clamp-2">
        {{
          description ||
          'No description provided. Google will try to generate a snippet from the page content.'
        }}
      </div>
    </div>

    <!-- FACEBOOK / LINKEDIN (Large Image) -->
    <div
      v-else-if="type === 'facebook' || type === 'linkedin'"
      class="font-sans bg-[#f0f2f5] p-4 rounded-lg mx-auto"
      :class="isMobile ? 'max-w-[350px]' : 'max-w-[500px]'"
    >
      <div class="bg-white border border-gray-300 rounded overflow-hidden shadow-sm">
        <div
          class="aspect-[1.91/1] bg-gray-100 relative flex items-center justify-center overflow-hidden"
        >
          <img v-if="image" :src="image" class="w-full h-full object-cover" />
          <div v-else class="text-gray-400 flex flex-col items-center">
            <UIcon name="Photo" class="w-12 h-12 mb-2" />
            <span class="text-xs font-bold uppercase">No Image</span>
          </div>
        </div>
        <div class="p-3 bg-[#f2f3f5] border-t border-gray-200">
          <div class="text-xs text-[#606770] uppercase mb-0.5 truncate">{{ url }}</div>
          <div class="font-bold text-[#1d2129] leading-tight mb-1 line-clamp-2">
            {{ title }}
          </div>
          <div class="text-sm text-[#606770] line-clamp-1">{{ description }}</div>
        </div>
      </div>
    </div>

    <!-- TWITTER (Summary Large Image) -->
    <div v-else-if="type === 'twitter'" class="font-sans mx-auto" :class="isMobile ? 'max-w-[350px]' : 'max-w-[500px]'">
      <div class="bg-black/5 p-4 rounded-lg">
        <div class="bg-white rounded-2xl overflow-hidden border border-gray-200">
          <div
            class="aspect-[2/1] bg-gray-100 relative flex items-center justify-center overflow-hidden"
          >
            <img v-if="image" :src="image" class="w-full h-full object-cover" />
            <div v-else class="text-gray-400 flex flex-col items-center">
              <UIcon name="Photo" class="w-12 h-12 mb-2" />
              <span class="text-xs font-bold uppercase">No Image</span>
            </div>
          </div>
          <div class="p-3">
            <div class="text-[#0f1419] font-bold mb-0.5 truncate">{{ title }}</div>
            <div class="text-[#536471] text-sm mb-1 line-clamp-2">{{ description }}</div>
            <div class="text-[#536471] text-sm flex items-center gap-1">
              <UIcon name="Link" class="w-3 h-3" /> {{ url }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TELEGRAM -->
    <div v-else-if="type === 'telegram'" class="font-sans max-w-[400px]">
      <div class="bg-[#17212b] p-4 rounded-lg text-white">
        <div
          class="bg-[#2b5278] border-l-2 border-[#6ab3f3] pl-2 py-1 mb-2 rounded-r"
        >
          <div class="text-[#6ab3f3] font-bold text-sm">
            {{ props.data.ogSiteName || 'Site Name' }}
          </div>
          <div class="font-bold text-white mb-1">{{ title }}</div>
          <div class="text-sm text-[#dfebf5] line-clamp-3 mb-2">{{ description }}</div>
          <div v-if="image" class="rounded overflow-hidden">
            <img :src="image" class="max-w-full h-auto object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

