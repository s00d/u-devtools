<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UButton, USelect, UInput } from '@u-devtools/ui';

const props = defineProps<{
  api: ClientApi;
}>();

interface LogEntry {
  id: string;
  type: 'stdout' | 'stderr';
  data: string;
  timestamp: number;
}

const scripts = ref<string[]>([]);
const selectedScript = ref<string>('');
const logs = ref<LogEntry[]>([]);
const isRunning = ref(false);
const currentProcessId = ref<string>('');

const loadScripts = async () => {
  try {
    scripts.value = await props.api.rpc.call<string[]>('term:list');
    if (scripts.value.length > 0 && !selectedScript.value) {
      selectedScript.value = scripts.value[0];
    }
  } catch (e) {
    props.api.notify(`Failed to load scripts: ${e}`, 'error');
  }
};

const runScript = async () => {
  if (!selectedScript.value || isRunning.value) return;

  const id = Math.random().toString(36).slice(2);
  currentProcessId.value = id;
  isRunning.value = true;
  logs.value = [];

  try {
    await props.api.rpc.call('term:run', { scriptName: selectedScript.value, id });
    props.api.notify(`Running: ${selectedScript.value}`, 'info');
  } catch (e) {
    props.api.notify(`Failed to run script: ${e}`, 'error');
    isRunning.value = false;
  }
};

const killScript = async () => {
  if (!currentProcessId.value) return;

  try {
    await props.api.rpc.call('term:kill', { id: currentProcessId.value });
    isRunning.value = false;
    currentProcessId.value = '';
  } catch (e) {
    props.api.notify(`Failed to kill process: ${e}`, 'error');
  }
};

const clearLogs = () => {
  logs.value = [];
};

let unsubscribeLog: (() => void) | undefined;
let unsubscribeClose: (() => void) | undefined;
let unsubscribeError: (() => void) | undefined;

onMounted(() => {
  loadScripts();

  unsubscribeLog = props.api.rpc.on('term:log', (data: unknown) => {
    const logData = data as { id: string; type: 'stdout' | 'stderr'; data: string };
    if (logData.id === currentProcessId.value) {
      logs.value.push({
        id: logData.id,
        type: logData.type,
        data: logData.data,
        timestamp: Date.now(),
      });
    }
  });

  unsubscribeClose = props.api.rpc.on('term:close', (data: unknown) => {
    const closeData = data as { id: string; code: number };
    if (closeData.id === currentProcessId.value) {
      isRunning.value = false;
      currentProcessId.value = '';
      props.api.notify(`Script finished with code ${closeData.code}`, closeData.code === 0 ? 'success' : 'error');
    }
  });

  unsubscribeError = props.api.rpc.on('term:error', (data: unknown) => {
    const errorData = data as { id: string; error: string };
    if (errorData.id === currentProcessId.value) {
      isRunning.value = false;
      currentProcessId.value = '';
      props.api.notify(`Script error: ${errorData.error}`, 'error');
    }
  });
});

onUnmounted(() => {
  if (unsubscribeLog) unsubscribeLog();
  if (unsubscribeClose) unsubscribeClose();
  if (unsubscribeError) unsubscribeError();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar -->
    <div class="p-4 border-b border-udt-c-border bg-gray-50 dark:bg-gray-800 flex gap-2 items-center">
      <USelect
        v-model="selectedScript"
        :options="scripts.map(s => ({ label: s, value: s }))"
        placeholder="Select script"
        class="w-64"
      />
      <UButton
        variant="primary"
        icon="i-carbon-play"
        :disabled="!selectedScript || isRunning"
        @click="runScript"
      >
        Run
      </UButton>
      <UButton
        v-if="isRunning"
        variant="danger"
        icon="i-carbon-stop"
        @click="killScript"
      >
        Stop
      </UButton>
      <UButton variant="ghost" icon="i-carbon-clean" @click="clearLogs" title="Clear logs" />
      <div class="ml-auto text-xs text-gray-500">
        {{ logs.length }} lines
      </div>
    </div>

    <!-- Terminal Output -->
    <div class="flex-1 overflow-auto p-4 bg-black text-green-400 font-mono text-sm">
      <div v-for="(log, idx) in logs" :key="idx" :class="log.type === 'stderr' ? 'text-red-400' : 'text-green-400'">
        {{ log.data }}
      </div>
      <div v-if="logs.length === 0" class="text-gray-500">
        No output yet. Select a script and click Run.
      </div>
    </div>
  </div>
</template>

