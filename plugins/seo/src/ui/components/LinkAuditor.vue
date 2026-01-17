<script setup lang="ts">
import { ref, computed } from 'vue';
import { UTable, UBadge, UButton, UInput, UIcon, USelect } from '@u-devtools/ui';
import { useApi } from '../../context';
import type { LinkItem } from '../../types';

const props = defineProps<{
  links: LinkItem[];
}>();

const api = useApi();

const checkedLinks = ref<Record<string, { status: number; redirect?: string; error?: string }>>({});
const isChecking = ref(false);
const filterType = ref('all'); // all, internal, external, broken
const search = ref('');

// Start checking
const checkAll = async () => {
  isChecking.value = true;

  // Create promise queue to avoid overwhelming network (5 at a time)
  const queue = [...props.links];
  const batchSize = 5;

  const processBatch = async () => {
    const batch = queue.splice(0, batchSize);
    if (batch.length === 0) return;

    await Promise.all(
      batch.map(async (link) => {
        // Cache results by URL
        if (checkedLinks.value[link.href]) return;

        try {
          const res = await api.rpc.call<{
            success: boolean;
            status?: number;
            redirectUrl?: string;
            error?: string;
          }>('seo:check-link', link.href);

          if (res.success && res.status !== undefined) {
            checkedLinks.value[link.href] = { status: res.status, redirect: res.redirectUrl };
          } else {
            checkedLinks.value[link.href] = { status: 0, error: res.error || 'Unknown error' };
          }
        } catch (e) {
          checkedLinks.value[link.href] = {
            status: 0,
            error: e instanceof Error ? e.message : 'Network error',
          };
        }
      })
    );

    if (queue.length > 0) {
      await processBatch();
    }
  };

  await processBatch();
  isChecking.value = false;
};

// Filtering
const filteredLinks = computed(() => {
  let items = props.links;

  // Filter Type
  if (filterType.value === 'internal') items = items.filter((l) => !l.isExternal);
  if (filterType.value === 'external') items = items.filter((l) => l.isExternal);
  if (filterType.value === 'broken') {
    items = items.filter((l) => {
      const info = checkedLinks.value[l.href];
      return info && (info.status >= 400 || info.status === 0);
    });
  }

  // Search
  if (search.value) {
    const q = search.value.toLowerCase();
    items = items.filter(
      (l) => l.href.toLowerCase().includes(q) || l.text.toLowerCase().includes(q)
    );
  }

  return items;
});

const getStatusColor = (status?: number): 'green' | 'yellow' | 'red' | 'gray' => {
  if (!status) return 'gray';
  if (status >= 200 && status < 300) return 'green';
  if (status >= 300 && status < 400) return 'yellow'; // Redirect
  return 'red'; // Error
};

const getStatusText = (status?: number): string => {
  if (!status) return '-';
  if (status >= 200 && status < 300) return String(status);
  if (status >= 300 && status < 400) return `${status} Redirect`;
  return String(status);
};
</script>

<template>
  <div class="space-y-4 px-4 pt-4">
    <!-- Toolbar -->
    <div class="flex items-center justify-between gap-4 p-4 bg-gray-800 rounded border border-gray-700">
      <div class="flex gap-2">
        <UButton 
          :loading="isChecking" 
          icon="Play" 
          size="sm" 
          @click="checkAll"
        >
          Check Status
        </UButton>
        <div class="h-8 w-px bg-gray-600 mx-2"></div>
        <USelect 
          v-model="filterType"
          size="sm"
          :options="[
            { label: 'All Links', value: 'all' },
            { label: 'Internal', value: 'internal' },
            { label: 'External', value: 'external' },
            { label: 'Broken (4xx/5xx)', value: 'broken' }
          ]" 
          class="w-40"
        />
      </div>
      <UInput v-model="search" placeholder="Search URL..." size="sm" class="w-64" />
    </div>

    <!-- Stats -->
    <div v-if="Object.keys(checkedLinks).length > 0" class="flex gap-4 text-sm">
      <div class="text-gray-400">
        Checked: <span class="text-white font-bold">{{ Object.keys(checkedLinks).length }}</span> / {{ links.length }}
      </div>
      <div class="text-green-400">
        OK: <span class="font-bold">{{ Object.values(checkedLinks).filter(l => l.status >= 200 && l.status < 300).length }}</span>
      </div>
      <div class="text-yellow-400">
        Redirects: <span class="font-bold">{{ Object.values(checkedLinks).filter(l => l.status >= 300 && l.status < 400).length }}</span>
      </div>
      <div class="text-red-400">
        Broken: <span class="font-bold">{{ Object.values(checkedLinks).filter(l => l.status >= 400 || l.status === 0).length }}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
      <UTable 
        :rows="filteredLinks" 
        :columns="[
          { key: 'status', label: 'Status', width: '90px' },
          { key: 'element', label: 'Type', width: '70px' },
          { key: 'href', label: 'URL / Text' },
          { key: 'details', label: 'Details', width: '120px' }
        ]"
      >
        <template #cell-status="{ row }">
          <div v-if="checkedLinks[(row as LinkItem).href]">
            <UBadge :color="getStatusColor(checkedLinks[(row as LinkItem).href].status)" size="xs">
              {{ getStatusText(checkedLinks[(row as LinkItem).href].status) }}
            </UBadge>
          </div>
          <span v-else class="text-gray-600 text-xs">-</span>
        </template>

        <template #cell-element="{ val }">
          <span class="text-[10px] uppercase font-bold text-gray-500">{{ val }}</span>
        </template>

        <template #cell-href="{ val, row }">
          <div class="flex flex-col max-w-[400px]">
            <a :href="val as string" target="_blank" class="text-blue-400 hover:underline truncate text-xs font-mono mb-0.5">
              {{ val }}
            </a>
            <span class="text-sm text-gray-300 truncate" :title="(row as LinkItem).text">
              {{ (row as LinkItem).text || '(No text)' }}
            </span>
            <div v-if="checkedLinks[(row as LinkItem).href]?.redirect" class="text-[10px] text-yellow-500 flex items-center gap-1 mt-1">
              <UIcon name="ArrowRight" class="w-3 h-3" />
              Redirect to: {{ checkedLinks[(row as LinkItem).href].redirect }}
            </div>
            <div v-if="checkedLinks[(row as LinkItem).href]?.error" class="text-[10px] text-red-400 mt-1">
              {{ checkedLinks[(row as LinkItem).href].error }}
            </div>
          </div>
        </template>

        <template #cell-details="{ row }">
          <div class="flex flex-wrap gap-1">
            <UBadge v-if="(row as LinkItem).isExternal" color="blue" size="xs">Ext</UBadge>
            <UBadge v-if="(row as LinkItem).target === '_blank'" color="gray" size="xs">Blank</UBadge>
            <UBadge v-if="(row as LinkItem).rel?.includes('nofollow')" color="yellow" size="xs">NoFollow</UBadge>
            <UBadge v-if="(row as LinkItem).issue" color="red" size="xs">Issue</UBadge>
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>

