<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UJsonTree, ULoading } from '@u-devtools/ui';
import { useApi } from '../context';

const api = useApi();

const configData = ref<Record<string, unknown>>({});
const loading = ref(false);

const loadConfig = async () => {
  loading.value = true;
  try {
    configData.value = await api.rpc.call('vite:config');
  } catch (e) {
    api.notify(`Failed to load config: ${e}`, 'error');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadConfig();
});
</script>

<template>
  <div class="flex-1 overflow-auto p-4">
    <ULoading v-if="loading" />
    <UJsonTree v-else :data="configData" />
  </div>
</template>

