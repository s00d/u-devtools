---
to: <%= projectName %>/src/ui/MyPanel.vue
---
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { UButton, UInput, UCard, UBadge } from '@u-devtools/ui';
<% if (features.includes('app-bridge')) { -%>
import { AppBridge } from '@u-devtools/core';
<% } -%>
import type { ClientApi } from '@u-devtools/core';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

const props = defineProps<{
  api: ClientApi;
}>();

const message = ref('Hello from <%= pluginName %>!');
const serverResponse = ref('');
<% if (features.includes('app-bridge')) { -%>
const appData = ref<{ message?: string } | null>(null);
<% } -%>

<% if (features.includes('settings')) { -%>
// Access settings reactively
const enabled = computed(() => props.api.settings.get('enabled', true));
const refreshInterval = computed(() => props.api.settings.get('refreshInterval', 1000));
<% } -%>

<% if (features.includes('app-bridge')) { -%>
// AppBridge for communication with App context
const bridge = new AppBridge('<%= pluginKebab %>');
<% } -%>

const callServer = async () => {
  try {
    const response = await props.api.rpc.call('<%= pluginKebab %>:hello');
    serverResponse.value = response as string;
    props.api.notify('Server responded!', 'success');
  } catch (error) {
    props.api.notify('Failed to call server', 'error');
    console.error(error);
  }
};

<% if (features.includes('app-bridge')) { -%>
const sendToApp = () => {
  bridge.send('<%= pluginKebab %>:action', { action: 'test' });
  props.api.notify('Message sent to App context', 'info');
};
<% } -%>

<% if (features.includes('settings')) { -%>
const updateSetting = () => {
  props.api.settings.set('enabled', !enabled.value);
  props.api.notify('Setting updated', 'success');
};
<% } -%>

<% if (features.includes('app-bridge')) { -%>
// Listen for events from App context
onMounted(() => {
  bridge.on('<%= pluginKebab %>:ready', (data: unknown) => {
    appData.value = data as { message?: string };
  });
});

onUnmounted(() => {
  bridge.close();
});
<% } -%>
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">{{ message }}</h1>
<% if (features.includes('settings')) { -%>
      <UBadge :color="enabled ? 'green' : 'gray'">
        {{ enabled ? 'Enabled' : 'Disabled' }}
      </UBadge>
<% } -%>
    </div>

    <UCard title="Server Communication" class="mb-4">
      <div class="space-y-2">
        <UButton variant="primary" @click="callServer">
          Call Server RPC
        </UButton>
        
        <div v-if="serverResponse" class="p-2 bg-gray-800 rounded">
          <p class="text-sm text-gray-300">Server response:</p>
          <p class="text-green-400 font-mono">{{ serverResponse }}</p>
        </div>
      </div>
    </UCard>

<% if (features.includes('app-bridge')) { -%>
    <UCard title="App Context Communication">
      <div class="space-y-2">
        <UButton variant="secondary" @click="sendToApp">
          Send to App Context
        </UButton>
        
        <div v-if="appData" class="p-2 bg-gray-800 rounded">
          <p class="text-sm text-gray-300">App data:</p>
          <p class="text-blue-400 font-mono">{{ appData.message || 'No message' }}</p>
        </div>
      </div>
    </UCard>
<% } -%>

<% if (features.includes('settings')) { -%>
    <UCard title="Settings">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-300">Enabled</span>
          <UButton size="xs" variant="ghost" @click="updateSetting">
            {{ enabled ? 'Disable' : 'Enable' }}
          </UButton>
        </div>
        
        <div class="text-sm">
          <span class="text-gray-300">Refresh Interval:</span>
          <span class="ml-2 text-gray-200">{{ refreshInterval }}ms</span>
        </div>
      </div>
    </UCard>
<% } -%>

    <UCard title="Storage Example">
      <div class="space-y-2">
        <UButton
          size="sm"
          variant="secondary"
          @click="() => {
            props.api.storage.set('test-key', 'test-value');
            props.api.notify('Saved to storage', 'success');
          }"
        >
          Save to Storage
        </UButton>
        
        <UButton
          size="sm"
          variant="secondary"
          @click="() => {
            const value = props.api.storage.get('test-key', 'not found');
            props.api.notify(`Value: ${value}`, 'info');
          }"
        >
          Read from Storage
        </UButton>
      </div>
    </UCard>
  </div>
</template>

