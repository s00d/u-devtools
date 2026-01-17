<script setup lang="ts">
import { UBadge, UIcon, UCard } from '@u-devtools/ui';
import type { HeadingItem, ImageItem } from '../../types';

defineProps<{
  headings: HeadingItem[];
  images: ImageItem[];
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- HEADINGS -->
    <UCard title="Headings Structure" class="border-gray-800">
      <div v-if="headings.length === 0" class="text-gray-500 text-sm italic">
        No headings found
      </div>
      <div v-else class="space-y-1 font-mono text-sm relative">
        <div
          v-for="(h, idx) in headings"
          :key="idx"
          class="flex items-center gap-2 py-1 hover:bg-white/5 rounded px-2 relative"
          :style="{
            paddingLeft: h.tag === 'alert' ? '0' : `${(h.level - 1) * 12 + 8}px`,
          }"
        >
          <!-- Connecting lines for hierarchy visualization -->
          <div
            v-if="h.tag !== 'alert' && h.level > 1"
            class="absolute left-0 top-0 bottom-0 w-px bg-gray-700"
            :style="{ left: `${(h.level - 2) * 12 + 4}px` }"
          ></div>
          
          <!-- Tag Badge -->
          <span
            v-if="h.tag !== 'alert'"
            class="text-[10px] uppercase font-bold w-6 text-center rounded bg-gray-800 border border-gray-700 text-gray-400 relative z-10"
          >
            {{ h.tag }}
          </span>

          <!-- Text -->
          <span
            :class="{
              'text-red-400 font-bold': h.tag === 'alert',
              'text-gray-300': h.tag !== 'alert',
            }"
            class="truncate relative z-10"
          >
            {{ h.text || '(Empty Heading)' }}
          </span>

          <!-- Issue -->
          <UBadge
            v-if="h.issue"
            :color="h.issue === 'Critical' ? 'red' : 'yellow'"
            size="xs"
            class="ml-auto shrink-0 relative z-10"
          >
            {{ h.issue }}
          </UBadge>
        </div>
      </div>
    </UCard>

    <!-- IMAGES -->
    <UCard title="Images Audit" class="border-gray-800">
      <div v-if="images.length === 0" class="text-gray-500 text-sm italic px-4">
        No images found
      </div>
      <div v-else class="space-y-3 px-4">
        <div
          v-for="(img, idx) in images"
          :key="idx"
          class="flex gap-3 items-start p-2 bg-gray-800/50 rounded border border-gray-700/50"
        >
          <!-- Thumbnail -->
          <div
            class="w-12 h-12 bg-black/20 rounded overflow-hidden flex-shrink-0 border border-gray-700"
          >
            <img :src="img.src" class="w-full h-full object-cover" />
          </div>

          <div class="flex-1 min-w-0 text-sm">
            <div class="flex justify-between">
              <span
                class="font-bold text-gray-300 truncate"
                :title="img.src"
              >
                {{ img.src.split('/').pop() }}
              </span>
              <UBadge
                v-if="img.issue"
                :color="img.issue.includes('alt') ? 'red' : 'yellow'"
                size="xs"
              >
                {{ img.issue }}
              </UBadge>
            </div>

            <div class="text-xs text-gray-500 mt-1 flex gap-3">
              <span :class="{ 'text-red-400': !img.alt }">
                Alt: {{ img.alt || 'MISSING' }}
              </span>
              <span>Dims: {{ img.naturalDimensions }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

