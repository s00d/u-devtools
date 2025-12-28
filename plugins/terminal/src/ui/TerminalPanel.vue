<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { UButton, UIcon } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const output = ref<string>('Welcome to Universal DevTools Terminal\nType any command (e.g. "ls -la", "npm run build")\n');
const input = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

// История команд
const history = ref<string[]>([]);
const historyIndex = ref(-1);

// Читаем настройки через settings API (который синхронизирован с модалкой настроек)
// Используем computed с api.settings.get() для реактивности (как в NetworkPanel)
const quickCommands = computed(() => {
  const commands = props.api.settings.get<Array<{ label: string; cmd: string }>>('quickCommands', [
    { label: 'List Files', cmd: 'ls -la' },
    { label: 'Build', cmd: 'npm run build' }
  ]);
  return Array.isArray(commands) ? commands : [];
});

const fontSize = computed(() => props.api.settings.get<number>('fontSize', 13));

const runQuick = (cmd: string) => {
  input.value = cmd;
  execute();
};

// Слушаем логи с сервера
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

  // Сохраняем в историю
  history.value.push(cmd);
  historyIndex.value = -1;

  // Отправляем на сервер
  await props.api.rpc.call('term:execute', cmd);
  
  input.value = '';
  await nextTick();
  inputRef.value?.focus();
};

// Навигация по истории (Стрелки Вверх/Вниз)
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

// Очистка
const clear = () => {
  output.value = '';
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = props.api.rpc.on('term:data', (data: unknown) => {
    onData(data as string);
  });
  // Фокус на инпут при клике в любом месте терминала
  nextTick(() => inputRef.value?.focus());
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<template>
  <div 
    class="h-full flex flex-col bg-[#111827] text-gray-300 font-mono text-sm overflow-hidden"
    @click="inputRef?.focus()"
  >
    <!-- Quick Actions Toolbar -->
    <div
      v-if="quickCommands.length"
      class="flex gap-2 px-4 py-2 border-b border-gray-700 bg-gray-800 overflow-x-auto"
    >
      <button
        v-for="(qc, idx) in quickCommands"
        :key="idx"
        @click="runQuick(qc.cmd)"
        class="text-xs px-2 py-1 bg-gray-700 hover:bg-indigo-600 rounded text-gray-300 border border-gray-600 hover:border-indigo-500 transition whitespace-nowrap"
        :title="qc.cmd"
      >
        {{ qc.label }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="flex justify-between items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
      <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">Terminal</div>
      <button
        @click.stop="clear"
        class="text-gray-400 hover:text-white transition p-1 rounded hover:bg-gray-700"
        title="Clear Console"
      >
        <UIcon name="Trash" class="w-4 h-4" />
      </button>
    </div>

    <!-- Output Area -->
    <div
      ref="containerRef"
      class="flex-1 overflow-y-auto p-4 whitespace-pre-wrap break-all leading-snug scrollbar-thin"
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

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: #111827;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #6366f1;
}
</style>
