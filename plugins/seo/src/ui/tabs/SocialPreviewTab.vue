<script setup lang="ts">
import { ref } from 'vue';
import type { SeoTags } from '../../types';
import SocialPreview from '../SocialPreview.vue';
import GoogleSerpPreview from '../components/GoogleSerpPreview.vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  data: SeoTags;
}>();

const selectedPlatform = ref<'google' | 'facebook' | 'twitter'>('google');
const viewMode = ref<'desktop' | 'mobile'>('desktop');
</script>

<template>
  <div class="pb-6 space-y-8">
    <!-- Platform Selector -->
    <div class="flex justify-center">
      <div class="inline-flex bg-gray-800 rounded-lg border border-gray-700 p-1">
        <button
          v-for="platform in ['google', 'facebook', 'twitter'] as const"
          :key="platform"
          @click="selectedPlatform = platform"
          class="px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2 capitalize"
          :class="selectedPlatform === platform ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'"
        >
          <UIcon 
            :name="platform === 'google' ? 'MagnifyingGlass' : platform === 'facebook' ? 'GlobeAlt' : 'ChatBubbleLeftRight'" 
            class="w-4 h-4" 
          />
          {{ platform }}
        </button>
      </div>
    </div>

    <!-- Mobile/Desktop Toggle (for all platforms) -->
    <div class="flex justify-center">
      <div class="inline-flex bg-gray-800 rounded-lg border border-gray-700 p-1">
        <button
          @click="viewMode = 'desktop'"
          class="px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2"
          :class="viewMode === 'desktop' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'"
        >
          <UIcon name="ComputerDesktop" class="w-4 h-4" />
          Desktop
        </button>
        <button
          @click="viewMode = 'mobile'"
          class="px-4 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2"
          :class="viewMode === 'mobile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200'"
        >
          <UIcon name="DevicePhoneMobile" class="w-4 h-4" />
          Mobile
        </button>
      </div>
    </div>

    <!-- Preview Content -->
    <div class="max-w-[600px] mx-auto">
      <!-- Google Preview -->
      <GoogleSerpPreview 
        v-if="selectedPlatform === 'google'" 
        :data="data" 
        :mode="viewMode === 'desktop' ? 'Desktop' : 'Mobile'"
      />
      <!-- Facebook & Twitter Previews -->
      <SocialPreview 
        v-else 
        :type="selectedPlatform" 
        :data="data"
        :mode="viewMode === 'desktop' ? 'Desktop' : 'Mobile'"
      />
      
      <!-- Info Footer -->
      <div class="mt-8 text-center text-xs text-gray-600">
        Preview is an approximation. Actual rendering may vary by platform updates.
        <span v-if="selectedPlatform === 'google' && viewMode === 'mobile'" class="block mt-1 text-gray-500">
          Mobile: Title ~50 chars, Description ~120 chars
        </span>
        <span v-else-if="selectedPlatform === 'google' && viewMode === 'desktop'" class="block mt-1 text-gray-500">
          Desktop: Title ~60 chars, Description ~160 chars
        </span>
      </div>
    </div>
  </div>
</template>
