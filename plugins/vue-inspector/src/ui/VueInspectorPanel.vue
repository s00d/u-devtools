<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UTabButtons } from '@u-devtools/ui';
import { useVirtualRouter } from '../composables/useVirtualRouter';
import ComponentsTab from './tabs/ComponentsTab.vue';
import PiniaTab from './tabs/PiniaTab.vue';
import RouterTab from './tabs/RouterTab.vue';
import TimelineTab from './tabs/TimelineTab.vue';
import type { VirtualRoute } from '../types';

const props = defineProps<{ api: ClientApi }>();

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
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900">
    <!-- Tabs -->
    <div class="flex-none border-b border-gray-700 bg-gray-800">
      <UTabButtons
        :items="tabNames"
        :model-value="currentRoute?.name || 'Components'"
        @update:model-value="(name) => {
          const route = routes.find(r => r.name === name);
          if (route) router.push(route.path);
        }"
      />
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-hidden">
      <component
        v-if="router.currentComponent.value"
        :is="router.currentComponent.value"
        :api="api"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
