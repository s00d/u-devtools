<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
// Импортируем отдельные хуки
import { useBridge, useApi } from '../context';
import { UButton, UInput, UBadge, UJsonTree, UEmpty, UIcon, UPluginLayout } from '@u-devtools/ui';
import { getLevelColor } from '@u-devtools/utils';
import type { ConsoleLog } from '../types';

const props = defineProps<{
  onRegisterClear: (fn: () => void) => void;
}>();

// Получаем уже типизированный bridge и api!
// VS Code теперь знает все методы: console-log, clear-logs и т.д.
const bridge = useBridge();
const api = useApi();

const logs = ref<ConsoleLog[]>([]);
const filter = ref('');
const levelFilter = ref<'all' | 'log' | 'warn' | 'error' | 'info' | 'debug'>('all');

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

// Храним функцию отписки
let stopListening: (() => void) | undefined;

onMounted(() => {
  // TypeScript теперь подсказывает 'console-log' и тип аргумента log!
  stopListening = bridge.on('console-log', (log) => {
    logs.value.unshift(log);
    if (logs.value.length > 500) {
      logs.value.pop();
    }
  });

  props.onRegisterClear(clear);
});

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
  stopListening?.();
});
</script>

<template>
  <UPluginLayout title="Console" icon="CommandLine">
    <template #actions>
      <UButton icon="Trash" size="sm" @click="clear" title="Clear" />
      <UInput v-model="filter" placeholder="Filter logs..." class="w-64" size="sm" />
      <select
        v-model="levelFilter"
        class="border border-gray-700 rounded px-2 py-1 text-sm bg-gray-800 text-gray-200"
      >
        <option value="all">All Levels</option>
        <option value="log">Log</option>
        <option value="info">Info</option>
        <option value="warn">Warn</option>
        <option value="error">Error</option>
        <option value="debug">Debug</option>
      </select>
      <div class="text-xs text-gray-500">{{ filteredLogs.length }} logs</div>
    </template>

    <!-- Logs List -->
    <div class="h-full overflow-auto p-2 space-y-1">
      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="p-2 rounded border border-zinc-800 hover:bg-gray-800 transition-colors"
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
  </UPluginLayout>
</template>

