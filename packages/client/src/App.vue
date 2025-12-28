<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted, watch } from 'vue';
import { useDark } from '@vueuse/core';
import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { plugins as rawPlugins } from 'virtual:u-devtools-plugins';
import PluginRenderer from './components/PluginRenderer.vue';
import { useNotifications } from './composables/useNotifications';
import { useSettings } from './composables/useSettings';
import { createPluginStorage } from './composables/usePluginStorage';
import CommandPalette from './components/CommandPalette.vue';
import { UInput, UButton, UModal } from '@u-devtools/ui';

if (!import.meta.hot) {
  throw new Error('Vite HMR is required for DevTools');
}

const rpc = new ViteRpcClient(import.meta.hot);
const { notifications, notify } = useNotifications();
const { getSetting, saveSetting } = useSettings();

const plugins = shallowRef<PluginClientInstance[]>(rawPlugins);
const activePluginId = ref<string>(plugins.value[0]?.name || '');
const showSettings = ref(false);
const isPaletteOpen = ref(false);

const isDark = useDark({
  storageKey: 'u-devtools-theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

const currentPlugin = computed(() => plugins.value.find((p) => p.name === activePluginId.value));

const createApiForPlugin = (pluginName: string): ClientApi => ({
  rpc,
  notify,
  storage: createPluginStorage(pluginName),
});

// Plugins are initialized when they are rendered

const openSettings = () => {
  showSettings.value = true;
};

const onKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isPaletteOpen.value = !isPaletteOpen.value;
  }
  if (e.key === 'Escape') {
    if (isPaletteOpen.value) {
      isPaletteOpen.value = false;
    } else if (showSettings.value) {
      showSettings.value = false;
    } else {
      const iframe = document.getElementById('u-devtools-iframe') as HTMLIFrameElement;
      const closeBtn = document.getElementById('u-devtools-close') as HTMLButtonElement;
      if (iframe && iframe.style.display !== 'none') {
        iframe.style.display = 'none';
        if (closeBtn) closeBtn.style.display = 'none';
      }
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<template>
  <div class="flex h-screen w-screen bg-white text-gray-800 font-sans overflow-hidden udt-reset">
    <!-- A. Activity Bar (Left) -->
    <div
      class="w-12 flex-none bg-gray-900 flex flex-col items-center py-4 gap-4 border-r border-gray-800 z-10"
    >
      <button
        v-for="p in plugins"
        :key="p.name"
        @click="activePluginId = p.name"
        :title="p.name"
        class="w-8 h-8 rounded flex items-center justify-center transition-all duration-200"
        :class="[
          activePluginId === p.name
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            : 'text-gray-400 hover:text-white hover:bg-gray-800',
        ]"
      >
        <div :class="[p.icon, 'text-xl']" />
      </button>

      <!-- Settings & Theme Toggle -->
      <div class="mt-auto flex flex-col items-center pb-4 gap-4">
        <button
          @click="isDark = !isDark"
          class="text-gray-400 hover:text-white transition"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <div :class="isDark ? 'i-carbon-sun' : 'i-carbon-moon'" class="text-xl" />
        </button>
        <button
          @click="openSettings"
          class="text-gray-400 hover:text-white transition"
          title="Settings"
        >
          <div class="i-carbon-settings text-xl" />
        </button>
      </div>
    </div>

    <!-- B. Sidebar (Optional) -->
    <div
      v-if="currentPlugin?.renderSidebar"
      class="w-64 flex-none border-r border-gray-200 bg-gray-50 flex flex-col"
    >
      <div
        class="h-10 border-b flex items-center px-4 font-semibold text-xs uppercase tracking-wider text-gray-500 bg-gray-100"
      >
        {{ currentPlugin.name }}
      </div>
      <div class="flex-1 overflow-hidden relative">
        <PluginRenderer :renderer="currentPlugin.renderSidebar" :api="createApiForPlugin(currentPlugin.name)" />
      </div>
    </div>

    <!-- C. Main View -->
    <div class="flex-1 flex flex-col min-w-0 bg-white relative z-0">
      <div v-if="currentPlugin" class="flex-1 overflow-hidden relative">
        <PluginRenderer
          :renderer="currentPlugin.renderMain"
          :api="createApiForPlugin(currentPlugin.name)"
        />
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-300 flex-col gap-2">
        <div class="i-carbon-cube text-4xl" />
        <p>Select a plugin to start</p>
      </div>
    </div>

    <!-- D. Notifications Toast -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="px-4 py-2 rounded shadow-lg text-sm text-white transform transition-all animate-fade-in-up pointer-events-auto"
        :class="{
          'bg-gray-800': n.type === 'info',
          'bg-red-600': n.type === 'error',
          'bg-green-600': n.type === 'success',
        }"
      >
        {{ n.message }}
      </div>
    </div>

    <!-- E. Settings Modal -->
    <UModal :visible="showSettings" title="Settings" @close="showSettings = false">
      <div v-for="plugin in plugins" :key="plugin.name" class="mb-8">
        <div v-if="plugin.settings" class="mb-4">
          <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <div :class="plugin.icon" />
            <span>{{ plugin.name }}</span>
          </h3>

          <div class="space-y-4 pl-4 border-l-2 border-gray-100">
            <div v-for="(schema, key) in plugin.settings" :key="key">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ schema.label }}</label>

              <UInput
                v-if="schema.type === 'string'"
                :model-value="String(getSetting(plugin.name, String(key), schema.default) ?? '')"
                @update:model-value="(val: string) => saveSetting(plugin.name, String(key), val)"
              />

              <label
                v-if="schema.type === 'boolean'"
                class="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="Boolean(getSetting(plugin.name, String(key), schema.default))"
                  @change="
                    (e) =>
                      saveSetting(
                        plugin.name,
                        String(key),
                        (e.target as HTMLInputElement).checked
                      )
                  "
                  class="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-600">Enabled</span>
              </label>

              <select
                v-if="schema.type === 'select'"
                :value="String(getSetting(plugin.name, String(key), schema.default) ?? '')"
                @change="
                  (e) => saveSetting(plugin.name, String(key), (e.target as HTMLSelectElement).value)
                "
                class="border rounded px-2 py-1 w-full"
              >
                <option v-for="opt in schema.options" :key="String(opt.value)" :value="String(opt.value)">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </UModal>

    <!-- F. Command Palette -->
    <CommandPalette
      v-if="isPaletteOpen"
      :visible="isPaletteOpen"
      :plugins="plugins"
      @close="isPaletteOpen = false"
    />
  </div>
</template>

<style>
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.2s ease-out;
}
</style>
