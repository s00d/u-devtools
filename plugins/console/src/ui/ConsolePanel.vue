<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import { UButton, UInput, UBadge, UJsonTree, UEmpty } from '@u-devtools/ui';
import { getLevelColor } from '@u-devtools/utils';

const props = defineProps<{
  api: ClientApi;
  onRegisterClear: (fn: () => void) => void;
}>();

interface ConsoleLog {
  id: string;
  level: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  args: unknown[];
  timestamp: number;
}

const logs = ref<ConsoleLog[]>([]);
const filter = ref('');
const levelFilter = ref<'all' | 'log' | 'warn' | 'error' | 'info' | 'debug'>('all');
const bridge = new AppBridge('console');

const clear = () => {
  logs.value = [];
};

const filteredLogs = computed(() => {
  let result = logs.value;

  if (levelFilter.value !== 'all') {
    result = result.filter((log) => log.level === levelFilter.value);
  }

  if (filter.value) {
    const query = filter.value.toLowerCase();
    result = result.filter((log) => log.message.toLowerCase().includes(query));
  }

  return result;
});

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = bridge.on<ConsoleLog>('console-log', (log) => {
    logs.value.unshift(log);
    if (logs.value.length > 500) {
      logs.value.pop();
    }
  });

  props.onRegisterClear(clear);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar -->
    <div class="p-2 border-b border-udt-c-border bg-gray-800 flex gap-2 items-center">
      <UButton icon="Trash" size="sm" @click="clear" title="Clear" />
      <UInput v-model="filter" placeholder="Filter logs..." class="w-64" />
      <select
        v-model="levelFilter"
        class="border border-udt-c-border rounded px-2 py-1 text-sm bg-udt-c-bg text-udt-c-text"
      >
        <option value="all">All Levels</option>
        <option value="log">Log</option>
        <option value="info">Info</option>
        <option value="warn">Warn</option>
        <option value="error">Error</option>
        <option value="debug">Debug</option>
      </select>
      <div class="text-xs text-gray-500 ml-auto">{{ filteredLogs.length }} logs</div>
    </div>

    <!-- Logs List -->
    <div class="flex-1 overflow-auto p-2 space-y-1">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="p-2 rounded border border-udt-c-border hover:bg-gray-800 transition-colors"
        :class="{
          'bg-red-900/20 border-red-800': log.level === 'error',
          'bg-yellow-900/20 border-yellow-800': log.level === 'warn',
        }"
      >
        <div class="flex items-start gap-2">
          <UBadge :color="getLevelColor(log.level)" class="flex-shrink-0">
            {{ log.level.toUpperCase() }}
          </UBadge>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-mono break-words">{{ log.message }}</div>
            <div v-if="log.args.length > 1" class="mt-2">
              <UJsonTree :data="log.args.slice(1)" :deep="2" />
            </div>
            <div class="text-xs text-gray-400 mt-1">
              {{ new Date(log.timestamp).toLocaleTimeString() }}
            </div>
          </div>
        </div>
      </div>
      <UEmpty v-if="filteredLogs.length === 0" icon="CommandLine" title="No logs to display" description="Console logs will appear here" />
    </div>
  </div>
</template>

