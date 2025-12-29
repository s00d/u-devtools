<script setup lang="ts">
import { onMounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { ULoading } from '@u-devtools/ui';
import { useRouterInfo } from '../../composables/useRouterInfo';
import RouterRoutes from '../components/RouterRoutes.vue';

const props = defineProps<{ api: ClientApi }>();

const router = useRouterInfo();

onMounted(() => {
  router.getRouterInfo();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 relative">
    <div v-if="router.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
      <ULoading text="Loading router info..." />
    </div>
    <RouterRoutes
      :router-info="router.routerInfo.value"
      :is-loading="router.isLoading.value"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

