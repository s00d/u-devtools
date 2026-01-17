<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { UButton, UIcon } from '@u-devtools/ui';
import { useApi } from '../context';

const api = useApi();

const output = ref<string>(
  'Welcome to Universal DevTools Terminal\nType any command (e.g. "ls -la", "npm run build")\n'
);
const input = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// Command history
const history = ref<string[]>([]);
const historyIndex = ref(-1);

// Read settings via settings API (which is synchronized with settings modal)
// Use computed with api.settings.get() for reactivity (like in NetworkPanel)
const quickCommands = computed(() => {
  const commands = api.settings.get<Array<{ label: string; cmd: string }>>('quickCommands', [
    { label: 'List Files', cmd: 'ls -la' },
    { label: 'Build', cmd: 'npm run build' },
  ]);
  return Array.isArray(commands) ? commands : [];
});

const fontSize = computed(() => api.settings.get<number>('fontSize', 13));

const runQuick = (cmd: string) => {
  input.value = cmd;
  execute();
};

// Listen for logs from server
const onData = (chunk: string) => {
  output.value += chunk;
  scrollToBottom();
};

const scrollToBottom = async () => {
  await nextTick();
  if (containerRef.value) {
    containerRef.value.scrollTop = containerRef.value.scrollHeight;
  }
};

const execute = async () => {
  const cmd = input.value.trim();
  if (!cmd) return;

  // Save to history
  history.value.push(cmd);
  historyIndex.value = -1;

  // Send to server
  await api.rpc.call('term:execute', cmd);

  input.value = '';
  await nextTick();
  inputRef.value?.focus();
};

// History navigation (Up/Down arrows)
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (history.value.length === 0) return;

    if (historyIndex.value === -1) {
      historyIndex.value = history.value.length - 1;
    } else if (historyIndex.value > 0) {
      historyIndex.value--;
    }
    input.value = history.value[historyIndex.value];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex.value === -1) return;

    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++;
      input.value = history.value[historyIndex.value];
    } else {
      historyIndex.value = -1;
      input.value = '';
    }
  }
};

// Clear
const clear = () => {
  output.value = '';
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = api.rpc.on('term:data', (data: unknown) => {
    onData(data as string);
  });
  // Focus input on click anywhere in terminal
  nextTick(() => inputRef.value?.focus());
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<template>
  <div 
    class="h-full flex flex-col bg-gray-900 text-gray-300 font-mono text-sm overflow-hidden"
    @click="inputRef?.focus()"
  >
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="CommandLine" class="w-5 h-5" />
            Terminal
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <div
            v-if="quickCommands.length"
            class="flex gap-2 overflow-x-auto"
          >
            <button
              v-for="(qc, idx) in quickCommands"
              :key="idx"
              @click.stop="runQuick(qc.cmd)"
              class="text-xs px-2 py-1 bg-gray-700 hover:bg-indigo-600 rounded text-gray-300 border border-gray-600 hover:border-indigo-500 transition whitespace-nowrap"
              :title="qc.cmd"
            >
              {{ qc.label }}
            </button>
          </div>
          <UButton
            icon="Trash"
            size="sm"
            variant="ghost"
            @click.stop="clear"
            title="Clear Console"
          />
        </div>
      </div>
    </div>

    <!-- Output Area -->
    <div
      ref="containerRef"
      class="flex-1 overflow-y-auto p-4 whitespace-pre-wrap break-all leading-snug [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-900 [&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-indigo-600"
      :style="{ fontSize: `${fontSize}px` }"
    >
      {{ output }}
    </div>

    <!-- Input Area -->
    <div class="flex items-center gap-2 p-3 bg-gray-800 border-t border-gray-700">
      <span class="text-indigo-400 font-bold select-none">➜</span>
      <input
        ref="inputRef"
        v-model="input"
        @keydown.enter="execute"
        @keydown="onKeyDown"
        type="text"
        class="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500"
        placeholder="Type command..."
        autocomplete="off"
        spellcheck="false"
      />
    </div>
  </div>
</template>
