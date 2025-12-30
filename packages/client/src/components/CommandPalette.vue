<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import type { PluginCommand, PluginClientInstance } from '@u-devtools/core';
import { UIcon } from '@u-devtools/ui';

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
      class="relative w-[500px] bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[60vh] animate-[fadeIn-scale_0.1s_ease-out]"
    >
      <div class="p-3 border-b border-white/5">
        <div class="relative">
          <UIcon name="MagnifyingGlass" class="absolute left-3 top-2.5 text-zinc-500 w-5 h-5" />
          <input
            ref="inputRef"
            v-model="search"
            class="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-transparent rounded-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-zinc-200 placeholder-zinc-600 transition-all duration-200 hover:bg-black/40"
            placeholder="Type a command..."
            @keydown="onKeydown"
          />
        </div>
      </div>

      <div class="overflow-y-auto flex-1 p-2">
        <div
          v-for="(cmd, idx) in filteredCommands"
          :key="cmd.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
          :class="
            idx === selectedIndex
              ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
              : 'hover:bg-white/5 text-zinc-200'
          "
          @click="execute(cmd)"
          @mousemove="selectedIndex = idx"
        >
          <UIcon :name="cmd.icon || 'CommandLine'" class="w-5 h-5 opacity-70" />
          <div class="flex-1">
            <div class="font-medium text-sm">{{ cmd.label }}</div>
            <div class="text-[10px] opacity-60 uppercase tracking-wider">{{ cmd.pluginName }}</div>
          </div>
          <div v-if="cmd.shortcut" class="flex gap-1">
            <span
              v-for="k in cmd.shortcut"
              :key="k"
              class="bg-white/10 px-1.5 rounded text-xs font-mono"
            >
              {{ k }}
            </span>
          </div>
        </div>

        <div v-if="filteredCommands.length === 0" class="p-8 text-center text-zinc-500">
          No commands found
        </div>
      </div>

      <div class="bg-black/20 border-t border-white/5 px-3 py-1.5 text-xs text-zinc-500 flex justify-between">
        <span>Arguments are not supported yet</span>
        <div class="flex gap-2">
          <span>⇅ Navigate</span>
          <span>↵ Select</span>
        </div>
      </div>
    </div>
  </div>
</template>

