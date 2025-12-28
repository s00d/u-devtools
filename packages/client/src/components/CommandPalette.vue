<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import type { PluginCommand, PluginClientInstance } from '@u-devtools/core';

const props = defineProps<{
  visible: boolean;
  plugins: PluginClientInstance[];
}>();

const emit = defineEmits<{
  close: [];
  execute: [command: PluginCommand];
}>();

const search = ref('');
const inputRef = ref<HTMLInputElement | null>(null);
const selectedIndex = ref(0);

const allCommands = computed(() => {
  const list: (PluginCommand & { pluginName: string })[] = [];
  props.plugins.forEach((p) => {
    if (p.commands) {
      p.commands.forEach((c) => {
        list.push({ ...c, pluginName: p.name });
      });
    }
  });
  return list;
});

const filteredCommands = computed(() => {
  const q = search.value.toLowerCase();
  return allCommands.value.filter(
    (c) => c.label.toLowerCase().includes(q) || c.pluginName.toLowerCase().includes(q)
  );
});

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % filteredCommands.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value =
      (selectedIndex.value - 1 + filteredCommands.value.length) % filteredCommands.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const cmd = filteredCommands.value[selectedIndex.value];
    if (cmd) {
      execute(cmd);
    }
  }
};

const execute = (cmd: PluginCommand) => {
  cmd.action();
  emit('execute', cmd);
  emit('close');
};

onMounted(() => {
  nextTick(() => {
    const input = inputRef.value as unknown as HTMLInputElement;
    if (input) {
      input.focus();
    }
  });
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
    @click.self="$emit('close')"
  >
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

    <div
      class="relative w-[500px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-fade-in"
    >
      <div class="p-3 border-b">
        <div class="relative">
          <div class="absolute left-3 top-2.5 text-gray-400 i-carbon-search text-lg" />
          <input
            ref="inputRef"
            v-model="search"
            class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a command..."
            @keydown="onKeydown"
          />
        </div>
      </div>

      <div class="overflow-y-auto flex-1 p-2">
        <div
          v-for="(cmd, idx) in filteredCommands"
          :key="cmd.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer transition-colors"
          :class="
            idx === selectedIndex
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-gray-100 text-gray-700'
          "
          @click="execute(cmd)"
          @mousemove="selectedIndex = idx"
        >
          <div :class="[cmd.icon || 'i-carbon-terminal', 'text-lg opacity-70']" />
          <div class="flex-1">
            <div class="font-medium text-sm">{{ cmd.label }}</div>
            <div class="text-[10px] opacity-60 uppercase tracking-wider">{{ cmd.pluginName }}</div>
          </div>
          <div v-if="cmd.shortcut" class="flex gap-1">
            <span
              v-for="k in cmd.shortcut"
              :key="k"
              class="bg-white/20 px-1.5 rounded text-xs font-mono"
            >
              {{ k }}
            </span>
          </div>
        </div>

        <div v-if="filteredCommands.length === 0" class="p-8 text-center text-gray-400">
          No commands found
        </div>
      </div>

      <div class="bg-gray-50 border-t px-3 py-1.5 text-xs text-gray-400 flex justify-between">
        <span>Arguments are not supported yet</span>
        <div class="flex gap-2">
          <span>⇅ Navigate</span>
          <span>↵ Select</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

