<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { UTable, UBadge, UButton, UInput, UEmpty, USplitter } from '@u-devtools/ui';
import { AppBridge } from '@u-devtools/core';
import type { ClientApi } from '@u-devtools/core';
import { getStatusColor } from '@u-devtools/utils';
import NetworkDetails from './NetworkDetails.vue';

const props = defineProps<{
  api?: ClientApi;
  onRegisterClear?: (fn: () => void) => void;
}>();

interface NetRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  duration?: number;
  error?: string;
  timestamp: number;
  startTime?: number;
  endTime?: number;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseHeaders?: Record<string, string>;
  responseBody?: unknown;
}

const requests = ref<NetRequest[]>([]);
const filter = ref('');
const selectedId = ref<string | null>(null);
const bridge = new AppBridge('network');

// Читаем настройки
const maxRequests = computed(() => 
  props.api?.settings?.get('maxRequests', 100) ?? 100
);

const clear = () => {
  requests.value = [];
  selectedId.value = null;
};

const filteredRequests = computed(() => {
  if (!filter.value) return requests.value;
  const lower = filter.value.toLowerCase();
  return requests.value.filter((r) => 
    r.url.toLowerCase().includes(lower) || 
    r.method.toLowerCase().includes(lower)
  );
});

const selectedRequest = computed(() => 
  requests.value.find(r => r.id === selectedId.value)
);


const selectRequest = (row: NetRequest) => {
  selectedId.value = row.id;
};

const replay = () => {
  if (!selectedRequest.value) return;
  const { url, method, requestHeaders, requestBody } = selectedRequest.value;
  bridge.send('replay', { url, method, headers: requestHeaders, body: requestBody });
};

const unsubscribes: (() => void)[] = [];

onMounted(() => {
  unsubscribes.push(
    bridge.on<{ 
      id: string; 
      url: string; 
      method: string; 
      startTime: number;
      requestHeaders?: Record<string, string>;
      requestBody?: unknown;
    }>('request-start', (data) => {
      requests.value.unshift({
        ...data,
        timestamp: data.startTime,
        status: 0,
      });
      if (requests.value.length > maxRequests.value) {
        requests.value.pop();
      }
    })
  );

  unsubscribes.push(
    bridge.on<{ 
      id: string; 
      status: number; 
      statusText: string; 
      endTime: number; 
      duration: number;
    }>('request-end', (data) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  unsubscribes.push(
    bridge.on<{ 
      id: string; 
      error: string; 
      endTime: number; 
      duration: number;
    }>('request-error', (data) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  // Добавляем обработчик для деталей (тело, заголовки)
  unsubscribes.push(
    bridge.on<{
      id: string;
      responseBody?: unknown;
      responseHeaders?: Record<string, string>;
    }>('request-details', (data) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  if (props.onRegisterClear) {
    props.onRegisterClear(clear);
  }
});

onUnmounted(() => {
  unsubscribes.forEach((unsub) => unsub());
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="p-2 border-b border-gray-700 bg-gray-800 flex gap-2">
      <UButton icon="Trash" size="sm" @click="clear" title="Clear" />
      <UInput v-model="filter" placeholder="Filter URLs..." class="w-64" />
    </div>

    <!-- Main Content with Splitter -->
    <div class="flex-1 overflow-hidden relative">
      <USplitter :default-size="400" :min="200" :max="800">
        
        <!-- LEFT: Table -->
        <template #left>
          <div class="h-full overflow-auto bg-gray-900">
            <UTable
              v-if="filteredRequests.length > 0"
              :rows="filteredRequests"
              :columns="[
                { key: 'method', label: 'Method', width: '80px' },
                { key: 'status', label: 'Status', width: '80px' },
                { key: 'url', label: 'Name' },
                { key: 'duration', label: 'Time', width: '100px' },
              ]"
            >
              <template #cell-method="{ val }">
                <span class="font-mono text-xs font-bold text-indigo-400">{{ val }}</span>
              </template>

              <template #cell-status="{ val }">
                <UBadge :color="getStatusColor(val as number | undefined)">
                  {{ (val as number) || '...' }}
                </UBadge>
              </template>

              <template #cell-url="{ val, row }">
                <div 
                  class="truncate max-w-[400px] cursor-pointer hover:text-indigo-400 transition-colors" 
                  :title="val as string"
                  :class="selectedId === (row as NetRequest).id ? 'text-indigo-400 font-medium' : ''"
                  @click="selectRequest(row as NetRequest)"
                >
                  {{ val as string }}
                </div>
              </template>

              <template #cell-duration="{ val }">
                <span v-if="val" class="text-gray-400 text-xs">
                  {{ (val as number).toFixed(0) }} ms
                </span>
                <span v-else class="text-gray-500 text-xs">-</span>
              </template>
            </UTable>
            <UEmpty 
              v-else 
              icon="GlobeAlt" 
              title="No network requests" 
              description="Network requests will appear here when you make HTTP calls" 
            />
          </div>
        </template>

        <!-- RIGHT: Details -->
        <template #right>
          <NetworkDetails 
            v-if="selectedRequest" 
            :request="selectedRequest" 
            @close="selectedId = null"
            @replay="replay"
          />
          <div 
            v-else 
            class="h-full flex items-center justify-center text-gray-400 bg-gray-900/50"
          >
            <div class="text-center">
              <p class="text-sm">Select a request to view details</p>
            </div>
          </div>
        </template>

      </USplitter>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
