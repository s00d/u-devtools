<script setup lang="ts">
import { computed, ref } from 'vue';
import { UTable, UBadge, UInput, UIcon } from '@u-devtools/ui';

const props = defineProps<{
  xmlContent: string;
}>();

const search = ref('');

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

const parsed = computed(() => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(props.xmlContent, 'text/xml');

  // Check if sitemapindex or urlset
  const isIndex = !!doc.querySelector('sitemapindex');
  const items: SitemapUrl[] = [];

  const tag = isIndex ? 'sitemap' : 'url';
  const nodes = doc.querySelectorAll(tag);

  nodes.forEach((node) => {
    items.push({
      loc: node.querySelector('loc')?.textContent || '',
      lastmod: node.querySelector('lastmod')?.textContent || undefined,
      changefreq: node.querySelector('changefreq')?.textContent || undefined,
      priority: node.querySelector('priority')?.textContent || undefined,
    });
  });

  return { isIndex, items };
});

const filteredItems = computed(() => {
  if (!search.value) return parsed.value.items;
  return parsed.value.items.filter((i) => i.loc.includes(search.value));
});

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <UBadge color="blue">{{ parsed.isIndex ? 'Sitemap Index' : 'URL Set' }}</UBadge>
        <UBadge color="gray">{{ parsed.items.length }} URLs</UBadge>
      </div>
      <UInput v-model="search" placeholder="Filter URLs..." size="sm" class="w-64" />
    </div>

    <div class="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <UTable 
        :rows="filteredItems" 
        :columns="[
          { key: 'loc', label: 'Location', width: '60%' },
          { key: 'lastmod', label: 'Last Mod' },
          { key: 'priority', label: 'Priority' },
          { key: 'changefreq', label: 'Freq' }
        ]"
      >
        <template #cell-loc="{ val }">
          <a :href="val as string" target="_blank" class="text-blue-400 hover:underline truncate block" :title="val as string">
            {{ val }}
          </a>
        </template>
        
        <template #cell-lastmod="{ val }">
          <span class="text-gray-400 text-xs">{{ formatDate(val as string) }}</span>
        </template>

        <template #cell-priority="{ val }">
          <div v-if="val" class="w-16 bg-gray-700 rounded-full h-2 overflow-hidden relative" title="Priority">
            <div class="absolute top-0 left-0 h-full bg-indigo-500" :style="{ width: `${parseFloat(val as string) * 100}%` }"></div>
          </div>
          <span v-else class="text-gray-600">-</span>
        </template>
      </UTable>
    </div>
  </div>
</template>

