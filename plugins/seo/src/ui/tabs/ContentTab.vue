<script setup lang="ts">
import { computed } from 'vue';
import type { SeoTags, KeywordItem, LinkItem } from '../../types';
import ContentAnalysis from '../components/ContentAnalysis.vue';
import TextAnalysis from '../components/TextAnalysis.vue';
import { UCard, UBadge, UTable, UIcon } from '@u-devtools/ui';

const props = defineProps<{
  data: SeoTags;
}>();

const externalLinksWithoutNoopener = computed(() =>
  (props.data.links || []).filter((l) => l.issue === 'Missing noopener (security risk)')
);
</script>

<template>
  <div class="pb-4 space-y-6">
    <!-- TEXT METRICS SECTION -->
    <TextAnalysis v-if="data.textStats" :stats="data.textStats" />

    <!-- IMAGES & HEADINGS SECTION -->
    <ContentAnalysis
      :headings="data.headings || []"
      :images="data.images || []"
    />

    <!-- KEYWORDS -->
    <UCard v-if="data.keywordDensity && data.keywordDensity.length > 0" title="Keyword Density" class="border-gray-800">
      <div class="px-4 pb-4">
        <div class="text-xs text-gray-500 mb-3">
          Top keywords found in page content (words longer than 3 characters)
        </div>
        <div class="space-y-2">
          <div
            v-for="(kw, idx) in data.keywordDensity"
            :key="idx"
            class="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700/50"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs text-gray-500 w-6">{{ idx + 1 }}</span>
              <span class="font-mono text-sm text-gray-300">{{ kw.word }}</span>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <span class="text-gray-500">Count: {{ kw.count }}</span>
              <span class="text-blue-400 font-bold">{{ kw.density }}%</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- LINKS -->
    <UCard v-if="data.links && data.links.length > 0" title="Links Audit" class="border-gray-800">
      <div class="px-4 pb-4">
        <div class="flex items-center justify-between mb-3">
          <div class="text-xs text-gray-500">
            Total: {{ data.links.length }} links
            <span v-if="externalLinksWithoutNoopener.length > 0" class="text-red-400 ml-2">
              ({{ externalLinksWithoutNoopener.length }} security issues)
            </span>
          </div>
        </div>
        <div class="space-y-2 max-h-[400px] overflow-y-auto">
          <div
            v-for="(link, idx) in data.links"
            :key="idx"
            class="flex items-start gap-3 p-2 bg-gray-800/50 rounded border"
            :class="link.issue ? 'border-red-900/50' : 'border-gray-700/50'"
          >
            <UIcon
              :name="link.isExternal ? 'ArrowTopRightOnSquare' : 'Link'"
              class="w-4 h-4 mt-0.5"
              :class="link.isExternal ? 'text-blue-400' : 'text-gray-500'"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-gray-300 truncate" :title="link.text">
                  {{ link.text || '(No text)' }}
                </span>
                <UBadge
                  v-if="link.isExternal"
                  color="blue"
                  size="xs"
                >
                  External
                </UBadge>
                <UBadge
                  v-if="link.issue"
                  color="red"
                  size="xs"
                >
                  {{ link.issue }}
                </UBadge>
              </div>
              <a
                :href="link.href"
                target="_blank"
                class="text-xs text-blue-400 hover:underline truncate block"
                :title="link.href"
              >
                {{ link.href }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

