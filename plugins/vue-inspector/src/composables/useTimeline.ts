import { ref, computed, onMounted, onUnmounted } from 'vue';
import { AppBridge } from '@u-devtools/core';
import type { TimelineEvent, TimelineLayer } from '../types';

/**
 * Composable for Timeline functionality
 */
export function useTimeline() {
  const events = ref<TimelineEvent[]>([]);
  const layers = ref<TimelineLayer[]>([]);
  const selectedLayerId = ref<string>('');
  const filterType = ref<string>('');
  const isLoading = ref(false);
  const maxEvents = ref(1000); // Limit events to prevent performance issues

  const bridge = new AppBridge('vue-inspector');

  // Filtered events
  const filteredEvents = computed(() => {
    let result = events.value;

    if (selectedLayerId.value) {
      result = result.filter((event) => event.layerId === selectedLayerId.value);
    }

    if (filterType.value) {
      const filter = filterType.value.toLowerCase();
      result = result.filter((event) => {
        return event.type?.toLowerCase().includes(filter) ||
               event.title?.toLowerCase().includes(filter) ||
               (event.subtitle?.toLowerCase().includes(filter));
      });
    }

    return result.slice(-maxEvents.value); // Keep only last N events
  });

  // Grouped events by time
  const groupedEvents = computed(() => {
    const groups: Record<number, TimelineEvent[]> = {};
    filteredEvents.value.forEach((event) => {
      const timeGroup = Math.floor(event.time / 1000) * 1000; // Group by second
      if (!groups[timeGroup]) {
        groups[timeGroup] = [];
      }
      groups[timeGroup].push(event);
    });
    return groups;
  });

  // --- Actions ---

  const getTimelineEvents = (layerId?: string) => {
    try {
      isLoading.value = true;
      bridge.send('inspector:getTimelineEvents', { layerId: layerId || selectedLayerId.value });
    } catch (_e) {
      isLoading.value = false;
      // Ignore if bridge is closed
    }
  };

  const getTimelineLayers = () => {
    try {
      bridge.send('inspector:getTimelineLayers');
    } catch (_e) {
      // Ignore if bridge is closed
    }
  };

  const clearEvents = () => {
    events.value = [];
  };

  // --- Listeners ---

  bridge.on('inspector:timelineEvents', (timelineEvents: TimelineEvent[]) => {
    events.value = timelineEvents || [];
    isLoading.value = false;
  });

  bridge.on('inspector:timelineLayers', (timelineLayers: TimelineLayer[]) => {
    layers.value = timelineLayers || [];
    // Auto-select first layer
    if (layers.value.length > 0 && !selectedLayerId.value) {
      selectedLayerId.value = layers.value[0].id;
      getTimelineEvents(layers.value[0].id);
    }
  });

  // --- Lifecycle ---

  onMounted(() => {
    getTimelineLayers();
    const timer = setInterval(() => {
      if (selectedLayerId.value) {
        getTimelineEvents(selectedLayerId.value);
      }
    }, 2000);
    onUnmounted(() => clearInterval(timer));
  });

  onUnmounted(() => {
    // Don't close bridge - it's shared
  });

  return {
    events: filteredEvents,
    groupedEvents,
    layers,
    selectedLayerId,
    filterType,
    isLoading,
    maxEvents,
    getTimelineEvents,
    getTimelineLayers,
    clearEvents,
  };
}
