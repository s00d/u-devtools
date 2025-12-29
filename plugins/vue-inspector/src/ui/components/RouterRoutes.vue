<script setup lang="ts">
import { computed } from 'vue';
import type { RouteRecord, RouteInfo } from '../../types';
import { UTable, UEmpty, UBadge, ULoading } from '@u-devtools/ui';

const props = defineProps<{
  routerInfo: RouteInfo | null;
  isLoading?: boolean;
}>();

const routes = computed(() => props.routerInfo?.routes || []);
const currentRoute = computed(() => props.routerInfo?.currentRoute);

const tableColumns = [
  { key: 'path', label: 'Path' },
  { key: 'name', label: 'Name' },
  { key: 'component', label: 'Component' },
];

const tableRows = computed(() => {
  return routes.value.map((route) => ({
    path: route.path,
    name: route.name || '-',
    component: route.component || '-',
    route,
  }));
});
</script>

<template>
  <div class="h-full overflow-auto bg-gray-900 p-4">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ULoading text="Loading router info..." />
    </div>
    <div v-else-if="!routerInfo" class="flex items-center justify-center h-full">
      <UEmpty
        icon="Route"
        title="No router found"
        description="Vue Router is not detected in this application"
      />
    </div>
    <div v-else class="space-y-6">
      <!-- Current Route -->
      <div v-if="currentRoute" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Route</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-300">Path:</span>
              <code class="text-sm text-indigo-300">{{ currentRoute.path }}</code>
            </div>
            <div v-if="currentRoute.name" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-300">Name:</span>
              <code class="text-sm text-indigo-300">{{ currentRoute.name }}</code>
            </div>
            <div v-if="currentRoute.params && Object.keys(currentRoute.params).length > 0" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-300">Params:</span>
              <code class="text-sm text-indigo-300">{{ JSON.stringify(currentRoute.params) }}</code>
            </div>
            <div v-if="currentRoute.query && Object.keys(currentRoute.query).length > 0" class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-300">Query:</span>
              <code class="text-sm text-indigo-300">{{ JSON.stringify(currentRoute.query) }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Routes List -->
      <div class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">All Routes</h3>
        <div class="bg-gray-800 rounded border border-gray-700">
          <UTable
            :columns="tableColumns"
            :rows="tableRows"
            :empty-message="'No routes found'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

