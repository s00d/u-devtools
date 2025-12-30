<script setup lang="ts">
import { computed } from 'vue';
import type { CustomInspectorState } from '../../types';
import { UJsonTree, UEmpty, ULoading } from '@u-devtools/ui';

const props = defineProps<{
  state: Record<string, CustomInspectorState[]>;
  isLoading?: boolean;
}>();

const hasState = computed(() => {
  if (!props.state) return false;
  return Object.keys(props.state).length > 0;
});

// Convert state to object for UJsonTree
const stateObject = computed(() => {
  if (!props.state) return null;

  const result: Record<string, unknown> = {};

  Object.entries(props.state).forEach(([key, states]) => {
    if (Array.isArray(states) && states.length > 0) {
      result[key] = states.reduce(
        (acc, item) => {
          if (item && typeof item === 'object' && 'key' in item && typeof item.key === 'string') {
            acc[item.key] = 'value' in item ? item.value : item;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );
    }
  });

  return result;
});
</script>

<template>
  <div class="h-full overflow-auto bg-gray-900 p-4">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ULoading text="Loading store state..." />
    </div>
    <div v-else-if="!hasState" class="flex items-center justify-center h-full">
      <UEmpty
        icon="DocumentText"
        title="No store selected"
        description="Select a Pinia store from the tree to view its state"
      />
    </div>
    <div v-else-if="stateObject" class="space-y-6">
      <div v-for="(value, key) in stateObject" :key="key" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">{{ key }}</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <UJsonTree :data="value" :editable="key === 'state'" />
        </div>
      </div>
    </div>
  </div>
</template>

