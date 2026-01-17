<script setup lang="ts">
import { ref, computed } from 'vue';
import { UButton, UInput, USelect, UTable, UBadge, UIcon } from '@u-devtools/ui';
import type { RouteReport, LighthouseScore } from '../../types';
import ScoreRing from '../components/ScoreRing.vue';

const props = defineProps<{
  reports: RouteReport[];
  isScanning: boolean;
  onStartScan: () => void;
}>();

const filter = ref('');
const sortBy = ref<'path' | 'performance' | 'accessibility' | 'seo'>('path');

const averages = computed(() => {
  const completed = props.reports.filter((r) => r.score);
  if (completed.length === 0) return null;

  const sum = (key: keyof LighthouseScore) =>
    completed.reduce((acc, r) => acc + (r.score?.[key] ?? 0), 0);

  return {
    performance: sum('performance') / completed.length,
    accessibility: sum('accessibility') / completed.length,
    'best-practices': sum('best-practices') / completed.length,
    seo: sum('seo') / completed.length,
  };
});

const filteredReports = computed(() => {
  let reports = [...props.reports];

  if (filter.value) {
    const filterLower = filter.value.toLowerCase();
    reports = reports.filter((r) => r.path.toLowerCase().includes(filterLower));
  }

  reports.sort((a, b) => {
    if (sortBy.value === 'path') {
      return a.path.localeCompare(b.path);
    }

    const aScore = a.score?.[sortBy.value] ?? 0;
    const bScore = b.score?.[sortBy.value] ?? 0;
    return bScore - aScore;
  });

  return reports;
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header with Start Button -->
    <div class="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-white text-lg mb-1 flex items-center gap-2">
          <UIcon name="ChartBar" class="w-5 h-5" />
          Unlighthouse Scanner
        </h3>
        <p class="text-sm text-gray-400">
          Automated Lighthouse audits for your site routes
        </p>
      </div>
      <UButton
        :disabled="isScanning"
        :loading="isScanning"
        icon="ArrowPath"
        @click="onStartScan"
      >
        {{ isScanning ? 'Scanning...' : 'Start Scan' }}
      </UButton>
    </div>

    <!-- Averages (if available) -->
    <div v-if="averages" class="p-4 border-b border-gray-800 bg-gray-900/50">
      <div class="flex items-center gap-2 mb-3">
        <UIcon name="ChartBarSquare" class="w-4 h-4 text-gray-400" />
        <span class="text-sm font-semibold text-gray-300">Average Scores</span>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <ScoreRing :score="averages.performance" label="Performance" />
        </div>
        <div class="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <ScoreRing :score="averages.accessibility" label="Accessibility" />
        </div>
        <div class="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <ScoreRing :score="averages['best-practices']" label="Best Practices" />
        </div>
        <div class="flex flex-col items-center p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <ScoreRing :score="averages.seo" label="SEO" />
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div v-if="reports.length > 0" class="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center gap-4">
      <UInput
        v-model="filter"
        placeholder="Filter by path..."
        size="sm"
        class="flex-1 max-w-xs"
        icon="MagnifyingGlass"
      />
      <USelect
        v-model="sortBy"
        :options="[
          { label: 'Sort by Path', value: 'path' },
          { label: 'Sort by Performance', value: 'performance' },
          { label: 'Sort by Accessibility', value: 'accessibility' },
          { label: 'Sort by SEO', value: 'seo' }
        ]"
        size="sm"
        class="w-48"
      />
      <div class="text-xs text-gray-500">
        {{ filteredReports.length }} / {{ reports.length }} routes
      </div>
    </div>

    <!-- Reports Table -->
    <div class="flex-1 overflow-auto">
      <div v-if="reports.length === 0" class="flex items-center justify-center h-full text-gray-500">
        <div class="text-center">
          <UIcon name="ChartBar" class="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p class="text-lg mb-2">No reports yet</p>
          <p class="text-sm text-gray-600">
            Click "Start Scan" to begin scanning your site routes
          </p>
        </div>
      </div>
      <div v-else class="border-t border-gray-800">
        <UTable
          :rows="filteredReports"
          :columns="[
            { key: 'path', label: 'Path', width: '35%' },
            { key: 'status', label: 'Status', width: '10%' },
            { key: 'performance', label: 'Performance', width: '15%' },
            { key: 'accessibility', label: 'Accessibility', width: '15%' },
            { key: 'best-practices', label: 'Best Practices', width: '15%' },
            { key: 'seo', label: 'SEO', width: '10%' }
          ]"
        >
          <template #cell-path="{ val, row }">
            <div class="flex flex-col">
              <span class="font-mono text-sm text-gray-300">{{ val }}</span>
              <span v-if="(row as RouteReport).seo?.title" class="text-xs text-gray-500 truncate mt-0.5">
                {{ (row as RouteReport).seo.title }}
              </span>
            </div>
          </template>
          <template #cell-status="{ val }">
            <UBadge
              :color="val === 'completed' ? 'green' : 'yellow'"
              size="xs"
            >
              {{ val === 'completed' ? 'Done' : 'Waiting' }}
            </UBadge>
          </template>
          <template #cell-performance="{ row }">
            <div v-if="(row as RouteReport).score?.performance !== null && (row as RouteReport).score?.performance !== undefined" class="flex items-center gap-2">
              <ScoreRing :score="(row as RouteReport).score!.performance!" :size="32" />
              <span class="text-xs text-gray-400 font-mono">
                {{ Math.round((row as RouteReport).score!.performance! * 100) }}
              </span>
            </div>
            <span v-else class="text-gray-600">-</span>
          </template>
          <template #cell-accessibility="{ row }">
            <div v-if="(row as RouteReport).score?.accessibility !== null && (row as RouteReport).score?.accessibility !== undefined" class="flex items-center gap-2">
              <ScoreRing :score="(row as RouteReport).score!.accessibility!" :size="32" />
              <span class="text-xs text-gray-400 font-mono">
                {{ Math.round((row as RouteReport).score!.accessibility! * 100) }}
              </span>
            </div>
            <span v-else class="text-gray-600">-</span>
          </template>
          <template #cell-best-practices="{ row }">
            <div v-if="(row as RouteReport).score?.['best-practices'] !== null && (row as RouteReport).score?.['best-practices'] !== undefined" class="flex items-center gap-2">
              <ScoreRing :score="(row as RouteReport).score!['best-practices']!" :size="32" />
              <span class="text-xs text-gray-400 font-mono">
                {{ Math.round((row as RouteReport).score!['best-practices']! * 100) }}
              </span>
            </div>
            <span v-else class="text-gray-600">-</span>
          </template>
          <template #cell-seo="{ row }">
            <div v-if="(row as RouteReport).score?.seo !== null && (row as RouteReport).score?.seo !== undefined" class="flex items-center gap-2">
              <ScoreRing :score="(row as RouteReport).score!.seo!" :size="32" />
              <span class="text-xs text-gray-400 font-mono">
                {{ Math.round((row as RouteReport).score!.seo! * 100) }}
              </span>
            </div>
            <span v-else class="text-gray-600">-</span>
          </template>
        </UTable>
      </div>
    </div>
  </div>
</template>

