<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { UTable, UBadge, UButton, UInput, UEmpty, USplitter, UTabs, UIcon, UPluginLayout } from '@u-devtools/ui';
import { useBridge, useApi } from '../context';
import { getStatusColor } from '@u-devtools/utils';
import NetworkDetails from './NetworkDetails.vue';
import MockPanel from './MockPanel.vue';
import RequestComposer from './components/RequestComposer.vue';
import type { MockRule } from '../types';

const props = defineProps<{
  onRegisterClear?: (fn: () => void) => void;
}>();

const bridge = useBridge();
const api = useApi();

interface NetRequest {
  id: string;
  url: string;
  method: string;
  type?: 'fetch' | 'xhr' | 'websocket' | 'eventsource' | 'beacon' | 'webtransport' | 'resource';
  subType?: 'http' | 'graphql' | 'grpc' | 'json-rpc' | 'unknown';
  clientLibrary?: string; // 'Axios', 'Apollo', 'TanStack Query', etc.
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
  isMock?: boolean;
  frames?: Array<{ id: string; time: number; type: 'send' | 'received'; data: string }>;
}

const requests = ref<NetRequest[]>([]);
const filter = ref('');
const selectedId = ref<string | null>(null);
const viewMode = ref<'Log' | 'Mocks' | 'Composer'>('Log');
const mockPanelRef = ref<InstanceType<typeof MockPanel> | null>(null);
const composerRef = ref<InstanceType<typeof RequestComposer> | null>(null);

// Read settings
const maxRequests = computed(() => api?.settings?.get('maxRequests', 100) ?? 100);

const clear = () => {
  requests.value = [];
  selectedId.value = null;
};

const filteredRequests = computed(() => {
  if (!filter.value) return requests.value;
  const lower = filter.value.toLowerCase();
  return requests.value.filter(
    (r) => r.url.toLowerCase().includes(lower) || r.method.toLowerCase().includes(lower)
  );
});

const selectedRequest = computed(() => requests.value.find((r) => r.id === selectedId.value));

const selectRequest = (row: NetRequest) => {
  selectedId.value = row.id;
};

// Load request into composer
const loadRequestToComposer = (request: NetRequest) => {
  viewMode.value = 'Composer';
  // Wait for next tick so component is mounted
  setTimeout(() => {
    composerRef.value?.loadRequest({
      method: request.method,
      url: request.url,
      requestHeaders: request.requestHeaders,
      requestBody: request.requestBody,
    });
  }, 0);
};

// Function to serialize data before sending via BroadcastChannel
const serializeData = (data: unknown): unknown => {
  return JSON.parse(JSON.stringify(data));
};

const replay = () => {
  if (!selectedRequest.value) return;
  const { url, method, requestHeaders, requestBody } = selectedRequest.value;
  // Serialize data before sending to avoid DataCloneError
  const serialized = serializeData({ url, method, headers: requestHeaders, body: requestBody });
  bridge.send('replay', serialized as { url: string; method: string; headers?: Record<string, string>; body?: unknown });
};

const unsubscribes: (() => void)[] = [];

onMounted(() => {
  unsubscribes.push(
    bridge.on('request-start', (data: {
      id: string;
      url: string;
      method: string;
      type?: 'fetch' | 'xhr' | 'websocket' | 'eventsource' | 'beacon' | 'webtransport' | 'resource';
      subType?: 'http' | 'graphql' | 'grpc' | 'json-rpc' | 'unknown';
      clientLibrary?: string;
      startTime: number;
      requestHeaders?: Record<string, string>;
      requestBody?: unknown;
      isMock?: boolean;
    }) => {
      requests.value.unshift({
        ...data,
        timestamp: data.startTime,
        status: 0,
        isMock: data.isMock || false,
        frames: data.type === 'websocket' || data.type === 'eventsource' || data.type === 'webtransport' ? [] : undefined,
      });
      if (requests.value.length > maxRequests.value) {
        requests.value.pop();
      }
    })
  );

  // WebSocket / SSE / WebTransport handlers
  unsubscribes.push(
    bridge.on('ws-open', (data: { 
      id: string; 
      url: string; 
      startTime: number; 
      type: 'websocket' | 'eventsource' | 'webtransport' 
    }) => {
      requests.value.unshift({
        id: data.id,
        url: data.url,
        method: data.type === 'websocket' ? 'WS' : data.type === 'eventsource' ? 'SSE' : 'WebTransport',
        type: data.type,
        subType: 'http',
        timestamp: data.startTime,
        startTime: data.startTime,
        status: 101, // Switching Protocols (convention)
        statusText: 'Pending',
        frames: [],
      });
      if (requests.value.length > maxRequests.value) {
        requests.value.pop();
      }
    })
  );

  unsubscribes.push(
    bridge.on('ws-frame', (data) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        if (!req.frames) req.frames = [];
        // Convert frame data to string for display
        const frameData = typeof data.frame.data === 'string' 
          ? data.frame.data 
          : '[Binary Data]';
        req.frames.unshift({
          ...data.frame,
          data: frameData
        }); // Add to top
      }
    })
  );

  unsubscribes.push(
    bridge.on('ws-close', (data: { 
      id: string; 
      endTime: number; 
      code?: number; 
      reason?: string 
    }) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        req.status = data.code || 200;
        req.statusText = data.reason || 'Closed';
        req.endTime = data.endTime;
        req.duration = data.endTime - (req.startTime || 0);
      }
    })
  );

  unsubscribes.push(
    bridge.on('ws-error', (data: { 
      id: string; 
      error: string; 
      endTime: number 
    }) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        req.error = data.error;
        req.endTime = data.endTime;
        req.duration = data.endTime - (req.startTime || 0);
      }
    })
  );

  unsubscribes.push(
    bridge.on('request-end', (data: {
      id: string;
      status: number;
      statusText: string;
      endTime: number;
      duration: number;
    }) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  unsubscribes.push(
    bridge.on('request-error', (data: {
      id: string;
      error: string;
      endTime: number;
      duration: number;
    }) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  // Add handler for details (body, headers)
  unsubscribes.push(
    bridge.on('request-details', (data: {
      id: string;
      responseBody?: unknown;
      responseHeaders?: Record<string, string>;
    }) => {
      const req = requests.value.find((r) => r.id === data.id);
      if (req) {
        Object.assign(req, data);
      }
    })
  );

  if (props.onRegisterClear) {
    props.onRegisterClear(clear);
  }

  // Function to serialize rules before sending
  const serializeRules = (rulesArray: unknown): unknown => {
    // Use JSON for deep serialization to remove Vue proxies
    return JSON.parse(JSON.stringify(rulesArray));
  };

  // Sync rules with App on mount and changes
  // Use watch on MockPanel component ref to get rules
  watch(
    () => mockPanelRef.value?.rules,
    (newRules) => {
      if (newRules) {
        bridge.send('update-mock-rules', serializeRules(newRules) as MockRule[]);
      }
    },
    { deep: true }
  );

  // Also on initialization need to send saved rules
  if (api) {
    const savedMocks = api.storage.get('mock-rules', []);
    if (savedMocks && savedMocks.length > 0) {
      bridge.send('update-mock-rules', serializeRules(savedMocks) as MockRule[]);
    }
  }
});

const getTypeColor = (type: string): 'gray' | 'yellow' | 'blue' | 'red' | 'green' | undefined => {
  switch(type) {
    case 'websocket': return 'blue';
    case 'webtransport': return 'green';
    case 'eventsource': return 'yellow';
    case 'resource': return 'gray';
    case 'beacon': return 'yellow';
    default: return 'blue';
  }
};

const getMethodColor = (method: string) => {
  if (method.startsWith('GQL:') || method.startsWith('RPC:') || method.startsWith('gRPC:')) {
    return 'text-green-400';
  }
  return 'text-indigo-400';
};

const getSubTypeClass = (subType: string) => {
  switch(subType) {
    case 'graphql': return 'bg-purple-900/50 text-purple-300 border border-purple-700';
    case 'grpc': return 'bg-blue-900/50 text-blue-300 border border-blue-700';
    case 'json-rpc': return 'bg-cyan-900/50 text-cyan-300 border border-cyan-700';
    default: return 'bg-gray-700 text-gray-300';
  }
};

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
  unsubscribes.forEach((unsub) => {
    unsub();
  });
});
</script>

<template>
  <UPluginLayout title="Network" icon="GlobeAlt">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        <UTabs
          :items="['Log', 'Mocks', 'Composer']"
          :model-value="viewMode"
          @update:model-value="(v) => viewMode = v as typeof viewMode"
        />
      </div>
    </template>
    <template #actions>
      <template v-if="viewMode === 'Log'">
        <UButton icon="Trash" size="sm" @click="clear" title="Clear" />
        <UInput
          v-model="filter"
          placeholder="Filter URLs..."
          class="w-64"
          size="sm"
        />
      </template>
    </template>

    <!-- Main Content -->
    <div class="h-full overflow-hidden relative">
      <!-- LOG VIEW (Existing splitter) -->
      <USplitter v-show="viewMode === 'Log'" :default-size="600" :min="200" :max="800">

        <!-- LEFT: Table -->
        <template #left>
          <div class="h-full overflow-auto bg-gray-900">
            <div v-if="filteredRequests.length > 0" class="w-full overflow-auto border border-gray-700 rounded">
              <table class="w-full text-left text-sm table-fixed">
                <colgroup>
                  <col style="width: 80px" />
                  <col style="width: 80px" />
                  <col />
                  <col style="width: 140px" />
                  <col style="width: 100px" />
                </colgroup>
                <thead class="bg-gray-800 border-b border-gray-700 font-semibold text-gray-200">
                  <tr>
                    <th class="px-4 py-2">Method</th>
                    <th class="px-4 py-2">Type</th>
                    <th class="px-4 py-2">Status</th>
                    <th class="px-4 py-2">Name</th>
                    <th class="px-4 py-2">Time</th>
                    <th class="px-4 py-2">Duration</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-700 bg-gray-900">
                  <tr
                    v-for="row in filteredRequests"
                    :key="row.id"
                    class="hover:bg-gray-800 transition-colors cursor-pointer"
                    :class="selectedId === row.id ? 'bg-gray-800' : ''"
                    @click="selectRequest(row)"
                  >
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <div class="flex flex-col gap-1">
                        <!-- Основной метод -->
                        <span class="font-mono text-xs font-bold" :class="getMethodColor(row.method)">
                          {{ row.method }}
                        </span>
                        <!-- Саб-тип протокола (GQL, gRPC, JSON-RPC) -->
                        <span 
                          v-if="row.subType && row.subType !== 'http'" 
                          class="text-[10px] px-1.5 py-0.5 rounded text-center w-fit font-semibold"
                          :class="getSubTypeClass(row.subType)"
                        >
                          {{ row.subType.toUpperCase() }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <UBadge size="xs" :color="getTypeColor(row.type || 'fetch')">
                        {{ row.type || 'fetch' }}
                      </UBadge>
                    </td>
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <UBadge
                        :color="
                          row.statusText?.includes('Mock')
                            ? 'blue'
                            : getStatusColor(row.status)
                        "
                      >
                        {{ row.status || '...' }}
                        <span v-if="row.statusText?.includes('Mock')" class="ml-1 text-xs"
                          >(Mock)</span
                        >
                      </UBadge>
                    </td>
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <div class="flex flex-col gap-1">
                        <!-- URL -->
                        <div
                          class="truncate max-w-[300px]"
                          :title="row.url"
                          :class="selectedId === row.id ? 'text-indigo-400 font-medium' : ''"
                        >
                          {{ row.url.split('/').pop() || row.url }}
                        </div>
                        
                        <!-- Бейджи протоколов и библиотек -->
                        <div class="flex gap-1 mt-0.5 flex-wrap">
                          <!-- Библиотека (Axios и т.д.) -->
                          <span 
                            v-if="row.clientLibrary" 
                            class="text-[9px] bg-white/10 text-white px-1.5 py-0.5 rounded border border-white/20 uppercase font-bold tracking-wider"
                          >
                            {{ row.clientLibrary }}
                          </span>

                          <!-- Протокол (GQL, gRPC) -->
                          <span 
                            v-if="row.subType && row.subType !== 'http'" 
                            class="text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold"
                            :class="getSubTypeClass(row.subType)"
                          >
                            {{ row.subType }}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <span v-if="row.timestamp" class="text-gray-400 text-xs font-mono">
                        {{ new Date(row.timestamp).toLocaleTimeString() }}
                      </span>
                      <span v-else class="text-gray-500 text-xs">-</span>
                    </td>
                    <td class="px-4 py-2 text-gray-100 overflow-hidden">
                      <span v-if="row.duration" class="text-gray-400 text-xs">
                        {{ row.duration.toFixed(0) }} ms
                      </span>
                      <span v-else class="text-gray-500 text-xs">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
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
            @load-to-composer="() => selectedRequest && loadRequestToComposer(selectedRequest)"
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

      <!-- MOCKS VIEW -->
      <div v-if="viewMode === 'Mocks'" class="h-full">
        <MockPanel ref="mockPanelRef" />
      </div>

      <!-- COMPOSER VIEW -->
      <div v-if="viewMode === 'Composer' && api" class="h-full">
        <RequestComposer ref="composerRef" />
      </div>
    </div>
  </UPluginLayout>
</template>
