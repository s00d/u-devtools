<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
import type { SeoTags } from '../../types';
import JsonLdViewer from '../components/JsonLdViewer.vue';

defineProps<{
  data: SeoTags;
}>();
</script>

<template>
  <div class="pb-4">
    <div v-if="data.jsonLd.length > 0">
      <JsonLdViewer :items="data.jsonLd" />
    </div>
    <div v-else class="text-center py-10 text-gray-500">
      <UIcon name="CodeBracket" class="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p>No Structured Data (JSON-LD) found.</p>
      <p class="text-xs mt-2">
        Add
        <code class="bg-gray-800 px-1 py-0.5 rounded"
          >&lt;script type="application/ld+json"&gt;</code
        >
        to your page.
      </p>
    </div>
  </div>
</template>

