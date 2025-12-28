<script setup lang="ts">
import { ref, computed, shallowRef, onMounted, onUnmounted, watch } from 'vue';
import { useDark } from '@vueuse/core';
import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi, PluginClientInstance } from '@u-devtools/core';
import { plugins as rawPlugins } from 'virtual:u-devtools-plugins';
import PluginRenderer from './components/PluginRenderer.vue';
import AboutPanel from './components/AboutPanel.vue';
import { useNotifications } from './composables/useNotifications';
import { useSettings } from './composables/useSettings';
import { createPluginStorage } from './composables/usePluginStorage';
import CommandPalette from './components/CommandPalette.vue';
import { UInput, UButton, UModal, UIcon, UForm } from '@u-devtools/ui';

if (!import.meta.hot) {
  throw new Error('Vite HMR is required for DevTools');
}

const rpc = new ViteRpcClient(import.meta.hot);
const { notifications, notify } = useNotifications();
const { getSetting, saveSetting } = useSettings();

const plugins = shallowRef<PluginClientInstance[]>(rawPlugins);
const activePluginId = ref<string>(plugins.value[0]?.name || 'internal:about');
const showSettings = ref(false);
const isPaletteOpen = ref(false);
const activeSettingsTab = ref<string>('');

const isDark = useDark({
  storageKey: 'u-devtools-theme',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

const currentPlugin = computed(() => plugins.value.find((p) => p.name === activePluginId.value));
const isAboutActive = computed(() => activePluginId.value === 'internal:about');

const createApiForPlugin = (pluginName: string): ClientApi => ({
  rpc,
  notify,
  storage: createPluginStorage(pluginName),
});

// Plugins are initialized when they are rendered

const openSettings = () => {
  showSettings.value = true;
};

const closeDevTools = () => {
  // Отправляем сообщение родительскому окну
  window.parent.postMessage('u-devtools:close', '*');
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

// Инициализация активного таба при открытии настроек
watch(showSettings, (val) => {
  if (val && !activeSettingsTab.value) {
    const first = plugins.value.find((p) => p.settings);
    if (first) activeSettingsTab.value = first.name;
  }
});

// Хелперы для сохранения всего объекта настроек плагина
const getPluginSettings = (pluginName: string) => {
  const result: Record<string, unknown> = {};
  const schema = plugins.value.find((p) => p.name === pluginName)?.settings || {};

  for (const key in schema) {
    // getSetting берет значение или дефолт
    result[key] = getSetting(pluginName, key, schema[key].default);
  }
  return result;
};

const savePluginSettings = (pluginName: string, values: Record<string, unknown>) => {
  for (const key in values) {
    saveSetting(pluginName, key, values[key]);
  }
};
</script>

<template>
  <div class="flex h-screen w-screen bg-white text-gray-800 font-sans overflow-hidden udt-reset">
    <!-- A. Activity Bar (Left) -->
    <div
      class="w-12 flex-none bg-gray-900 flex flex-col items-center py-4 gap-4 border-r border-gray-800 z-10"
    >
      <!-- Кнопка закрытия -->
      <button
        @click="closeDevTools"
        class="text-red-400 hover:text-red-500 transition-colors"
        title="Close DevTools"
      >
        <UIcon name="XMark" class="w-6 h-6" />
      </button>

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
        <UIcon :name="p.icon" class="text-xl" />
      </button>

      <!-- Bottom Actions -->
      <div class="mt-auto flex flex-col items-center pb-4 gap-4">
        <!-- About Button -->
        <button
          @click="activePluginId = 'internal:about'"
          class="w-8 h-8 rounded flex items-center justify-center transition-all duration-200 relative group"
          :class="isAboutActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'"
          title="About"
        >
          <UIcon name="InformationCircle" class="w-6 h-6" />
        </button>

        <div class="w-6 border-t border-gray-700 my-1"></div>

        <!-- Theme Toggle -->
        <button
          @click="isDark = !isDark"
          class="text-gray-400 hover:text-white transition"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <UIcon :name="isDark ? 'Sun' : 'Moon'" class="text-xl" />
        </button>
        <button
          @click="openSettings"
          class="text-gray-400 hover:text-white transition"
          title="Settings"
        >
          <UIcon name="Cog6Tooth" class="text-xl" />
        </button>
      </div>
    </div>

    <!-- B. Sidebar (Optional) -->
    <div
      v-if="!isAboutActive && currentPlugin?.renderSidebar"
      class="w-64 flex-none border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col"
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
    <div class="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 relative z-0">
      <!-- About View -->
      <AboutPanel v-if="isAboutActive" :plugins="plugins" />

      <!-- Plugin View -->
      <div v-else-if="currentPlugin" class="flex-1 overflow-hidden relative">
        <PluginRenderer
          :renderer="currentPlugin.renderMain"
          :api="createApiForPlugin(currentPlugin.name)"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex-1 flex items-center justify-center text-gray-300 flex-col gap-2">
        <UIcon name="Cube" class="w-16 h-16" />
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
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="showSettings = false"
    >
      <div
        class="bg-white dark:bg-[#111827] rounded-xl shadow-2xl w-[800px] h-[600px] flex overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        <!-- Sidebar (Plugins List) -->
        <div
          class="w-64 bg-gray-50 dark:bg-[#1f2937] border-r border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div class="p-4 font-bold text-lg dark:text-white border-b border-gray-200 dark:border-gray-700">
            Settings
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <button
              v-for="plugin in plugins.filter((p) => p.settings)"
              :key="plugin.name"
              @click="activeSettingsTab = plugin.name"
              class="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
              :class="
                activeSettingsTab === plugin.name
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              "
            >
              <UIcon :name="plugin.icon" class="w-4 h-4" />
              {{ plugin.name }}
            </button>
          </div>
        </div>

        <!-- Content (Form) -->
        <div class="flex-1 flex flex-col min-w-0">
          <div
            class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#111827]"
          >
            <h2 class="font-bold text-gray-900 dark:text-white">{{ activeSettingsTab }}</h2>
            <button
              @click="showSettings = false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <UIcon name="XMark" class="w-6 h-6" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6">
            <template v-for="plugin in plugins" :key="plugin.name">
              <div v-if="activeSettingsTab === plugin.name && plugin.settings">
                <UForm
                  :schema="plugin.settings"
                  :model-value="getPluginSettings(plugin.name)"
                  @update:model-value="(val) => savePluginSettings(plugin.name, val)"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

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
