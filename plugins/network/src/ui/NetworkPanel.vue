<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { UTable, UBadge, UButton, UInput, UEmpty } from '@u-devtools/ui';
import { AppBridge } from '@u-devtools/core';

const props = defineProps<{
  onRegisterClear?: (fn: () => void) => void;
}>();

interface NetRequest {
  id: string;
  url: string;
  method: string;
  status?: number;
  duration?: number;
  error?: string;
  timestamp: number;
}

const requests = ref<NetRequest[]>([]);
const filter = ref('');
const bridge = new AppBridge('network');

const clear = () => {
  requests.value = [];
};

const filteredRequests = computed(() => {
  if (!filter.value) return requests.value;
  return requests.value.filter((r) => r.url.toLowerCase().includes(filter.value.toLowerCase()));
});

const getStatusColor = (status?: number) => {
  if (!status) return 'gray';
  if (status >= 200 && status < 300) return 'green';
  if (status >= 300 && status < 400) return 'blue';
  if (status >= 400 && status < 500) return 'yellow';
  return 'red';
};

const unsubscribes: (() => void)[] = [];

onMounted(() => {
  unsubscribes.push(
    bridge.on<{ id: string; url: string; method: string; startTime: number }>('request-start', (data) => {
      requests.value.unshift({
        ...data,
        timestamp: data.startTime,
        status: 0,
      });
      if (requests.value.length > 100) {
        requests.value.pop();
      }
    })
  );

  unsubscribes.push(
    bridge.on<{ id: string; status: number; statusText: string; endTime: number; duration: number }>(
      'request-end',
      (data) => {
        const req = requests.value.find((r) => r.id === data.id);
        if (req) {
          Object.assign(req, data);
        }
      }
    )
  );

  unsubscribes.push(
    bridge.on<{ id: string; error: string; endTime: number; duration: number }>('request-error', (data) => {
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
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-2 border-b bg-gray-50 flex gap-2">
      <UButton icon="i-carbon-clean" size="sm" @click="clear" title="Clear" />
      <UInput v-model="filter" placeholder="Filter URLs..." class="w-64" />
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-hidden bg-white">
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
          <span class="font-mono text-xs font-bold">{{ val }}</span>
        </template>

        <template #cell-status="{ val }">
          <UBadge :color="getStatusColor(val as number | undefined)">{{ (val as number) || '...' }}</UBadge>
        </template>

        <template #cell-url="{ val }">
          <div class="truncate max-w-[400px]" :title="val as string">{{ val as string }}</div>
        </template>

        <template #cell-duration="{ val }">
          <span v-if="val" class="text-gray-500">{{ (val as number).toFixed(0) }} ms</span>
          <span v-else class="text-gray-300">-</span>
        </template>
      </UTable>
      <UEmpty v-else icon="i-carbon-network-4" title="No network requests" description="Network requests will appear here when you make HTTP calls" />
    </div>
  </div>
</template>
