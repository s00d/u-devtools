<script setup lang="ts">
import { ref } from 'vue';
import { UTabs } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';
import ModulesTab from './ModulesTab.vue';
import ResolveTab from './ResolveTab.vue';
import ConfigTab from './ConfigTab.vue';
import EventsTab from './EventsTab.vue';

const props = defineProps<{ api: ClientApi }>();

const activeTab = ref('Modules');
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <div class="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
      <UTabs :items="['Modules', 'Resolve', 'Config', 'Events']" v-model="activeTab" />
    </div>

    <ModulesTab v-if="activeTab === 'Modules'" :api="props.api" />
    <ResolveTab v-else-if="activeTab === 'Resolve'" :api="props.api" />
    <ConfigTab v-else-if="activeTab === 'Config'" :api="props.api" />
    <EventsTab v-else-if="activeTab === 'Events'" :api="props.api" />
  </div>
</template>

<style scoped>
/* Tailwind CSS v4 */
</style>
