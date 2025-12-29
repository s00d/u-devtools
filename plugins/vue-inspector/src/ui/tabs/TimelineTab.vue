<script setup lang="ts">
import { onMounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { USelect, UInput, UButton, UEmpty, ULoading } from '@u-devtools/ui';
import { useTimeline } from '../../composables/useTimeline';

const props = defineProps<{ api: ClientApi }>();

const timeline = useTimeline();

onMounted(() => {
  timeline.getTimelineLayers();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 p-4">
    <!-- Toolbar -->
    <div class="flex-none flex items-center gap-4 mb-4">
      <USelect
        v-model="timeline.selectedLayerId.value"
        :options="timeline.layers.value.map(l => ({ label: l.label, value: l.id }))"
        placeholder="Select layer..."
        class="w-64"
      />
      <UInput
        v-model="timeline.filterType.value"
        placeholder="Filter events..."
        class="w-64"
      />
      <UButton variant="ghost" size="sm" @click="timeline.clearEvents">
        Clear
      </UButton>
    </div>

    <!-- Events List -->
    <div class="flex-1 overflow-auto relative">
      <div v-if="timeline.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
        <ULoading text="Loading timeline events..." />
      </div>
      <div v-else-if="timeline.events.value.length === 0" class="flex items-center justify-center h-full">
        <UEmpty
          icon="Clock"
          title="No timeline events"
          description="Timeline events will appear here as they occur"
        />
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="event in timeline.events.value"
          :key="event.id"
          class="bg-gray-800 rounded border border-gray-700 p-3 hover:bg-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-200">{{ event.title }}</div>
              <div v-if="event.subtitle" class="text-xs text-gray-400 mt-1">{{ event.subtitle }}</div>
            </div>
            <div class="text-xs text-gray-500">
              {{ new Date(event.time).toLocaleTimeString() }}
            </div>
          </div>
          <div v-if="event.data" class="mt-2 text-xs text-gray-400">
            <pre class="bg-gray-900 p-2 rounded overflow-auto">{{ JSON.stringify(event.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

