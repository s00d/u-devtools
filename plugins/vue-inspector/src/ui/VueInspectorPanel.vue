<script setup lang="ts">
import { computed } from 'vue';
import { useApi } from '../context';
import { UTabs, UButton, UIcon, UPluginLayout } from '@u-devtools/ui';
import { useVirtualRouter } from '../composables/useVirtualRouter';
import ComponentsTab from './tabs/ComponentsTab.vue';
import PiniaTab from './tabs/PiniaTab.vue';
import RouterTab from './tabs/RouterTab.vue';
import TimelineTab from './tabs/TimelineTab.vue';
import type { VirtualRoute } from '../types';

const api = useApi();

const routes: VirtualRoute[] = [
  {
    path: '/components',
    name: 'Components',
    component: ComponentsTab,
    icon: 'Cube',
  },
  {
    path: '/pinia',
    name: 'Pinia',
    component: PiniaTab,
    icon: 'Cube',
  },
  {
    path: '/router',
    name: 'Router',
    component: RouterTab,
    icon: 'Route',
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: TimelineTab,
    icon: 'Clock',
  },
];

const router = useVirtualRouter(routes, '/components');

const tabNames = computed(() => routes.map((r) => r.name));
const currentRoute = computed(() => router.currentRoute.value);
const currentTabName = computed(() => currentRoute.value?.name || 'Components');

const handleTabChange = (name: string) => {
  const route = routes.find((r) => r.name === name);
  if (route) router.push(route.path);
};
</script>

<template>
  <UPluginLayout title="Vue Inspector" icon="Cube">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        <UTabs
          :items="tabNames"
          :model-value="currentTabName"
          :max-visible="5"
          @update:model-value="handleTabChange"
        />
      </div>
    </template>

    <!-- Tab Content -->
    <component
      v-if="router.currentComponent.value"
      :is="router.currentComponent.value"
    />
  </UPluginLayout>
</template>
