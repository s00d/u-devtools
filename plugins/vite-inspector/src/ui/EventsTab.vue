<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { UButton, UInput, USelect, UBadge, ULoading, UJsonTree, UIcon } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';
import { formatTime } from '@u-devtools/utils';

const props = defineProps<{ api: ClientApi }>();

interface ViteEvent {
  id: string;
  type: 'hmr' | 'connection' | 'error' | 'transform' | 'middleware' | 'module';
  timestamp: number;
  data: Record<string, unknown>;
}

const events = ref<ViteEvent[]>([]);
const eventsLoading = ref(false);
const eventsFilter = ref<'all' | ViteEvent['type']>('all');
const eventsLimit = ref(100);
const eventsStats = ref<{
  total: number;
  byType: Record<string, number>;
  oldest: number | null;
  newest: number | null;
} | null>(null);

const loadEvents = async () => {
  eventsLoading.value = true;
  try {
    events.value = await props.api.rpc.call('vite:events:list', {
      limit: eventsLimit.value,
      type: eventsFilter.value === 'all' ? undefined : eventsFilter.value
    });
    eventsStats.value = await props.api.rpc.call('vite:events:stats');
  } catch (e) {
    props.api.notify(`Failed to load events: ${e}`, 'error');
  } finally {
    eventsLoading.value = false;
  }
};

const clearEvents = async () => {
  try {
    await props.api.rpc.call('vite:events:clear');
    events.value = [];
    eventsStats.value = await props.api.rpc.call('vite:events:stats');
    props.api.notify('Events cleared', 'success');
  } catch (e) {
    props.api.notify(`Failed to clear events: ${e}`, 'error');
  }
};


const getEventColor = (type: ViteEvent['type']): 'gray' | 'red' | 'green' | 'yellow' | 'blue' => {
  const colors: Record<ViteEvent['type'], 'gray' | 'red' | 'green' | 'yellow' | 'blue'> = {
    hmr: 'blue',
    connection: 'green',
    error: 'red',
    transform: 'yellow',
    middleware: 'blue',
    module: 'gray'
  };
  return colors[type] || 'gray';
};

watch([eventsFilter, eventsLimit], () => {
  loadEvents();
});

onMounted(() => {
  loadEvents();
  
  // Подписка на новые события в реальном времени
  props.api.rpc.on('vite:hmr-log', () => {
    loadEvents();
  });
});
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Toolbar -->
    <div class="p-3 border-b border-gray-700 bg-gray-800 flex items-center gap-3 flex-wrap">
      <USelect 
        v-model="eventsFilter" 
        :options="[
          { value: 'all', label: 'All Types' },
          { value: 'hmr', label: 'HMR' },
          { value: 'connection', label: 'Connection' },
          { value: 'error', label: 'Error' },
          { value: 'transform', label: 'Transform' },
          { value: 'middleware', label: 'Middleware' },
          { value: 'module', label: 'Module' }
        ]"
        class="w-40"
      />
      <UInput 
        v-model.number="eventsLimit" 
        type="number" 
        placeholder="Limit" 
        class="w-24"
        min="10"
        max="500"
      />
      <div class="flex-1"></div>
      <div v-if="eventsStats" class="text-xs text-gray-400">
        Total: {{ eventsStats.total }} | 
        <span v-for="(count, type) in eventsStats.byType" :key="type" class="ml-2">
          {{ type }}: {{ count }}
        </span>
      </div>
      <UButton variant="ghost" size="sm" @click="loadEvents" :disabled="eventsLoading">
        <UIcon name="ArrowPath" class="w-4 h-4" />
      </UButton>
      <UButton variant="danger" size="sm" @click="clearEvents">
        <UIcon name="Trash" class="w-4 h-4" />
        Clear
      </UButton>
    </div>

    <!-- Events List -->
    <div class="flex-1 overflow-auto bg-gray-900">
      <ULoading v-if="eventsLoading" />
      <div v-else-if="events.length === 0" class="p-8 text-center text-gray-400">
        <UIcon name="DocumentText" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No events recorded yet</p>
      </div>
      <div v-else class="divide-y divide-gray-800">
        <div 
          v-for="event in events" 
          :key="event.id"
          class="p-3 hover:bg-gray-800 transition-colors"
        >
          <div class="flex items-start gap-3">
            <UBadge :color="getEventColor(event.type)" size="sm">
              {{ event.type }}
            </UBadge>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-400 font-mono">{{ formatTime(event.timestamp) }}</span>
                <span v-if="event.data.file" class="text-xs text-gray-300 font-mono truncate">
                  {{ event.data.file }}
                </span>
              </div>
              <div v-if="event.data.message" class="text-sm text-red-400">
                {{ event.data.message }}
              </div>
              <div v-else-if="event.data.action" class="text-sm text-gray-300">
                {{ event.data.action }}
              </div>
              <div v-if="Object.keys(event.data).length > 0" class="mt-2">
                <UJsonTree :data="event.data" :maxDepth="2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

