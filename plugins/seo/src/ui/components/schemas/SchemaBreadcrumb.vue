<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
const props = defineProps<{ data: any }>();
</script>

<template>
  <div class="font-sans bg-white p-3 rounded border border-gray-200 text-sm text-[#202124]">
    <div class="flex items-center flex-wrap gap-1">
      <template v-for="(item, idx) in data.itemListElement" :key="idx">
        <span v-if="idx > 0" class="text-gray-400">›</span>
        <a :href="item.item" class="hover:underline" :class="idx === data.itemListElement.length - 1 ? 'text-[#5f6368]' : 'text-[#1a0dab]'">
          {{ item.name }}
        </a>
      </template>
    </div>
  </div>
</template>

