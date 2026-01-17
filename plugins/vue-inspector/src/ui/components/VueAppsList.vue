<script setup lang="ts">
import { UButton, UIcon } from '@u-devtools/ui';
import type { VueApp } from '../../composables/useVueApps';

const props = defineProps<{
  apps: VueApp[];
  selectedAppId: string;
}>();

const emit = defineEmits<{
  select: [appId: string];
}>();

const handleSelect = (appId: string) => {
  emit('select', appId);
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 border-r border-gray-700">
    <div class="flex-none px-3 py-2 border-b border-gray-700 bg-gray-800/50">
      <div class="text-xs text-gray-400 font-semibold uppercase tracking-wide">Vue Applications</div>
    </div>
    <div class="flex-1 overflow-auto p-3">
      <div v-if="apps.length === 0" class="text-center text-gray-500 text-xs py-4">
        No Vue applications found
      </div>
      <div v-else class="space-y-1">
        <UButton
          v-for="app in apps"
          :key="app.id"
          :variant="selectedAppId === app.id ? 'primary' : 'ghost'"
          size="sm"
          @click="handleSelect(app.id)"
          class="w-full justify-start text-xs"
        >
          <UIcon name="Cube" class="w-3 h-3 mr-2" />
          <div class="flex-1 text-left flex flex-col">
            <span>{{ app.name }}</span>
            <span class="text-gray-400 text-[10px]">{{ app.id }}</span>
          </div>
          <span class="text-gray-400 ml-2">v{{ app.version }}</span>
        </UButton>
      </div>
    </div>
  </div>
</template>
