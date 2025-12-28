<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import { UTable, UBadge, UButton, UEmpty } from '@u-devtools/ui';

const props = defineProps<{ api: ClientApi }>();

interface RouteInfo {
  path: string;
  name?: string;
  meta?: Record<string, unknown>;
  active?: boolean;
}

interface RouteChange {
  path: string;
  name?: string;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  from?: {
    path: string;
    name?: string;
  };
}

const routes = ref<RouteInfo[]>([]);
const currentRoute = ref<RouteChange | null>(null);
const error = ref<string | null>(null);
const bridge = new AppBridge('vue-router');

const activeRoutes = computed(() => routes.value.filter((r) => r.active));
const inactiveRoutes = computed(() => routes.value.filter((r) => !r.active));

const navigateToRoute = (path: string) => {
  // Пытаемся найти роутер и навигировать
  const router = (window as any).__U_DEVTOOLS_VUE_ROUTER__;
  if (router) {
    router.push(path);
  } else {
    props.api.notify('Router not available for navigation', 'error');
  }
};

let unsubscribeList: (() => void) | undefined;
let unsubscribeChange: (() => void) | undefined;
let unsubscribeError: (() => void) | undefined;

onMounted(() => {
  unsubscribeList = bridge.on<RouteInfo[]>('router:list', (data) => {
    routes.value = data;
    error.value = null;
  });

  unsubscribeChange = bridge.on<RouteChange>('router:change', (data) => {
    currentRoute.value = data;
    props.api.notify(`Navigated to: ${data.path}`, 'info');
  });

  unsubscribeError = bridge.on<{ message: string }>('router:error', (data) => {
    error.value = data.message;
    props.api.notify(`Router Error: ${data.message}`, 'error');
  });
});

onUnmounted(() => {
  if (unsubscribeList) unsubscribeList();
  if (unsubscribeChange) unsubscribeChange();
  if (unsubscribeError) unsubscribeError();
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Error Banner -->
    <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
      <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
        <div class="i-carbon-warning text-lg" />
        <div class="text-sm font-mono">{{ error }}</div>
      </div>
      <div class="text-xs text-red-600 dark:text-red-400 mt-2">
        Add this to your main.ts: <code class="bg-red-100 dark:bg-red-900/30 px-1 rounded">window.__U_DEVTOOLS_VUE_ROUTER__ = router</code>
      </div>
    </div>

    <!-- Current Route Info -->
    <div v-if="currentRoute" class="p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800">
      <div class="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">Current Route</div>
      <div class="font-mono text-sm text-green-700 dark:text-green-300">{{ currentRoute.path }}</div>
      <div v-if="currentRoute.name" class="text-xs text-green-600 dark:text-green-400 mt-1">Name: {{ currentRoute.name }}</div>
      <div v-if="currentRoute.from" class="text-xs text-green-500 dark:text-green-500 mt-1">
        From: {{ currentRoute.from.path }}
      </div>
    </div>

    <!-- Routes List -->
    <div class="flex-1 overflow-auto p-4">
      <div v-if="activeRoutes.length > 0" class="mb-6">
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Active Route</h3>
        <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <div
            v-for="route in activeRoutes"
            :key="route.path"
            class="p-3 border-b border-green-200 dark:border-green-800 last:border-0 hover:bg-green-100 dark:hover:bg-green-900/30"
          >
            <div class="flex items-center gap-2">
              <UBadge color="green">Active</UBadge>
              <span class="font-mono text-sm font-bold text-green-800 dark:text-green-200">{{ route.path }}</span>
              <span v-if="route.name" class="text-xs text-green-600 dark:text-green-400">({{ route.name }})</span>
            </div>
            <div v-if="route.meta && Object.keys(route.meta).length > 0" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span class="font-semibold">Meta:</span>
              <pre class="inline ml-1 font-mono">{{ JSON.stringify(route.meta, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <div v-if="inactiveRoutes.length > 0">
        <h3 class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          All Routes ({{ routes.length }})
        </h3>
        <UTable
          :rows="routes"
          :columns="[
            { key: 'path', label: 'Path' },
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
            { key: 'actions', label: '', width: '100px' },
          ]"
        >
          <template #cell-path="{ val }">
            <span class="font-mono text-sm">{{ val }}</span>
          </template>

          <template #cell-name="{ val }">
            <span v-if="val" class="text-sm text-gray-600 dark:text-gray-400">{{ val }}</span>
            <span v-else class="text-xs text-gray-400 italic">—</span>
          </template>

          <template #cell-status="{ row }">
            <UBadge :color="(row as RouteInfo).active ? 'green' : 'gray'">
              {{ (row as RouteInfo).active ? 'Active' : 'Inactive' }}
            </UBadge>
          </template>

          <template #cell-actions="{ row }">
            <UButton
              variant="ghost"
              icon="i-carbon-arrow-right"
              size="sm"
              @click="navigateToRoute((row as RouteInfo).path)"
              title="Navigate"
            />
          </template>
        </UTable>
      </div>

      <UEmpty v-if="routes.length === 0 && !error" icon="i-carbon-route" title="No routes found" description="Vue Router routes will appear here" />
    </div>
  </div>
</template>

