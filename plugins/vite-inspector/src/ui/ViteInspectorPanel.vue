<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UButton, UTable, UBadge, UJsonTree, ULoading, UStat, UKeyValue, UTabs, UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  api: ClientApi;
  onRegisterActions: (restart: () => void, clearCache: () => void) => void;
}>();

const activeTab = ref<'dashboard' | 'config' | 'plugins' | 'env'>('dashboard');
interface ViteInfo {
  version?: string;
  nodeVersion?: string;
  mode?: string;
  root?: string;
  base?: string;
  configFile?: string | null;
  cacheDir?: string;
  serverUrl?: string | null;
  networkUrl?: string | null;
}
const info = ref<ViteInfo>({});
const configData = ref<Record<string, unknown>>({});
interface PluginInfo {
  name: string;
  enforce: string;
  apply: string;
  index: number;
}
const pluginsData = ref<PluginInfo[]>([]);
const envData = ref<Record<string, string>>({});
const isLoading = ref(false);

const load = async () => {
  isLoading.value = true;
  try {
    const [inf, conf, plugs, envs] = await Promise.all([
      props.api.rpc.call<ViteInfo>('vite:info'),
      props.api.rpc.call<Record<string, unknown>>('vite:config'),
      props.api.rpc.call<PluginInfo[]>('vite:plugins'),
      props.api.rpc.call<Record<string, string>>('vite:env'),
    ]);

    info.value = inf;
    configData.value = conf;
    pluginsData.value = plugs;
    envData.value = envs;
  } catch (e) {
    props.api.notify(`Failed to load data: ${e}`, 'error');
  } finally {
    isLoading.value = false;
  }
};

// Actions
const restartServer = async () => {
  if (!confirm('Restart Vite Server? Browser will reload.')) return;
  try {
    props.api.notify('Restarting server...', 'info');
    await props.api.rpc.call('vite:restart');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (e) {
    props.api.notify(`Failed to restart: ${e}`, 'error');
  }
};

const clearCache = async () => {
  if (!confirm('Clear Vite cache? This will force a full rebuild. Continue?')) return;
  try {
    const res = await props.api.rpc.call<{ success: boolean; path?: string; message?: string }>('vite:clearCache');
    props.api.notify(`Cache cleared! ${res.path || ''}`, 'success');
    // Обычно после очистки нужен рестарт
    setTimeout(() => {
      restartServer();
    }, 500);
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : String(e);
    props.api.notify(error, 'error');
  }
};

const openConfig = async () => {
  if (info.value.configFile) {
    try {
      await props.api.rpc.call('sys:openFile', {
        file: info.value.configFile,
        line: 1,
        column: 1,
      });
    } catch (e) {
      props.api.notify(`Failed to open config: ${e}`, 'error');
    }
  }
};

onMounted(() => {
  load();
  props.onRegisterActions(restartServer, clearCache);
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar / Tabs -->
    <div class="border-b border-udt-c-border bg-gray-50 dark:bg-gray-800 p-2 flex items-center justify-between flex-none">
      <UTabs
        :items="['dashboard', 'config', 'plugins', 'env']"
        :model-value="activeTab"
        @update:model-value="(v) => activeTab = v as typeof activeTab"
      />

      <UButton size="sm" variant="ghost" icon="i-carbon-renew" @click="load" title="Refresh Data" />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-4 relative">
      <ULoading v-if="isLoading" fullscreen />

      <!-- TAB: Dashboard -->
      <div v-if="activeTab === 'dashboard'" class="space-y-6">
        <div class="grid grid-cols-2 gap-4">
          <UStat label="Vite Version" :value="info.version || 'Loading...'" color="indigo" />
          <UStat label="Node Version" :value="info.nodeVersion || 'Loading...'" color="green" />
        </div>

        <div class="border border-udt-c-border rounded overflow-hidden bg-udt-c-bg divide-y divide-udt-c-border">
          <div class="flex items-center gap-2 py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="font-medium text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Config File</div>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <span class="font-mono text-sm text-gray-900 dark:text-gray-100">{{ info.configFile || 'Not found' }}</span>
              <UButton
                v-if="info.configFile"
                size="sm"
                variant="ghost"
                icon="i-carbon-launch"
                @click="openConfig"
                title="Open in editor"
              />
            </div>
          </div>
          <UKeyValue label="Root" :value="info.root || ''" copyable />
          <div class="flex items-start gap-4 py-2 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <div class="font-medium text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">Mode</div>
            <div class="flex-1">
              <UBadge color="blue">{{ info.mode || 'development' }}</UBadge>
            </div>
          </div>
          <UKeyValue label="Base" :value="info.base || '/'" copyable />
          <UKeyValue v-if="info.serverUrl" label="Local URL" :value="info.serverUrl" copyable />
          <UKeyValue v-if="info.networkUrl" label="Network URL" :value="info.networkUrl" copyable />
          <UKeyValue label="Cache Dir" :value="info.cacheDir || ''" copyable />
        </div>

        <div class="flex gap-4 pt-4">
          <UButton variant="primary" icon="i-carbon-restart" @click="restartServer"> Restart Server </UButton>
          <UButton variant="danger" icon="i-carbon-trash-can" @click="clearCache"> Force Clear Cache </UButton>
        </div>
      </div>

      <!-- TAB: Config -->
      <div v-else-if="activeTab === 'config'" class="h-full">
        <UJsonTree :data="configData" />
      </div>

      <!-- TAB: Plugins -->
      <div v-else-if="activeTab === 'plugins'">
        <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {{ pluginsData.length }} plugins loaded (order: pre → normal → post)
        </div>
        <UTable
          v-if="pluginsData.length > 0"
          :rows="pluginsData"
          :columns="[
            { key: 'index', label: '#', width: '50px' },
            { key: 'name', label: 'Plugin Name' },
            { key: 'enforce', label: 'Enforce', width: '100px' },
            { key: 'apply', label: 'Apply', width: '120px' },
          ]"
        >
          <template #cell-index="{ val }">
            <span class="text-xs text-gray-400 font-mono">#{{ val }}</span>
          </template>
          <template #cell-name="{ val }">
            <span class="font-bold text-gray-800 dark:text-gray-200">{{ val }}</span>
          </template>
          <template #cell-enforce="{ val }">
            <UBadge :color="val === 'pre' ? 'yellow' : val === 'post' ? 'blue' : 'gray'">{{ val }}</UBadge>
          </template>
          <template #cell-apply="{ val }">
            <span class="text-xs text-gray-600 dark:text-gray-400">{{ val }}</span>
          </template>
        </UTable>
        <UEmpty v-else icon="i-carbon-plug" title="No plugins found" description="No Vite plugins are configured" />
      </div>

      <!-- TAB: Env -->
      <div v-else-if="activeTab === 'env'">
        <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
          {{ Object.keys(envData).length }} environment variables (VITE_* only)
        </div>
        <UTable
          v-if="Object.keys(envData).length > 0"
          :rows="Object.entries(envData).map(([k, v]) => ({ key: k, value: v }))"
          :columns="[
            { key: 'key', label: 'Variable', width: '30%' },
            { key: 'value', label: 'Value' },
          ]"
        >
          <template #cell-key="{ val }">
            <span class="font-mono text-purple-700 dark:text-purple-400 font-semibold">{{ val }}</span>
          </template>
          <template #cell-value="{ val }">
            <span class="font-mono text-gray-600 dark:text-gray-300 break-all text-sm">{{ val }}</span>
          </template>
        </UTable>
        <UEmpty v-else icon="i-carbon-settings" title="No environment variables" description="No VITE_* environment variables found" />
      </div>
    </div>
  </div>
</template>


