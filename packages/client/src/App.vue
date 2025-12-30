<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useDevToolsState } from './composables/useDevToolsState';
import { initDefaultSettings } from './modules/settings';

// Components
import ActivityBar from './components/shell/ActivityBar.vue';
import PluginSidebar from './components/shell/PluginSidebar.vue';
import MainView from './components/shell/MainView.vue';
import SettingsModal from './components/settings/SettingsModal.vue';
import CommandPalette from './components/CommandPalette.vue';
import GlobalDialogs from './components/GlobalDialogs.vue';

const { notifications, plugins, showSettings, isPaletteOpen, activePluginId } = useDevToolsState();

// Инициализация настроек
initDefaultSettings(plugins.value);

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
    }
  }
};

// Обработка команд от overlay через BroadcastChannel
let controlChannel: BroadcastChannel | null = null;

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);

  // Слушаем команды от overlay
  controlChannel = new BroadcastChannel('u-devtools:control');
  controlChannel.onmessage = (e) => {
    const { action, pluginName, tabName } = e.data;

    if (action === 'switch-plugin' && pluginName) {
      // Переключаем на плагин
      const plugin = plugins.value.find((p) => p.name === pluginName);
      if (plugin) {
        activePluginId.value = pluginName;
      }
    } else if (action === 'switch-tab' && pluginName && tabName) {
      // Переключаем таб внутри плагина
      if (activePluginId.value === pluginName) {
        // Отправляем событие для переключения таба через bus
        // Плагины могут слушать это событие
        window.dispatchEvent(
          new CustomEvent('u-devtools:switch-tab', {
            detail: { pluginName, tabName },
          })
        );
      }
    }
  };
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  if (controlChannel) {
    controlChannel.close();
    controlChannel = null;
  }
});
</script>

<template>
  <!-- 
    Применяем масштаб и прозрачность через CSS переменные.
  -->
  <div 
    class="flex h-screen w-screen font-sans overflow-hidden udt-reset relative bg-zinc-950 text-gray-200"
    :style="{ 
      zoom: 'var(--udt-scale)',
      opacity: 'var(--udt-opacity)'
    }"
  >
    <!-- Highlight Line (Верхняя подсветка для 3D эффекта) -->
    <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-50"></div>

    <!-- Layout -->
    <ActivityBar />
    <PluginSidebar />
    <MainView />

    <!-- Overlays -->
    <SettingsModal />
    <GlobalDialogs />
    <CommandPalette 
      v-if="isPaletteOpen" 
      :visible="isPaletteOpen" 
      :plugins="plugins" 
      @close="isPaletteOpen = false" 
    />

    <!-- Notifications -->
    <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="px-4 py-2 rounded shadow-lg text-sm text-white transform transition-all animate-[fade-in-up_0.2s_ease-out] pointer-events-auto"
        :class="{
          'bg-gray-800': n.type === 'info',
          'bg-red-600': n.type === 'error',
          'bg-green-600': n.type === 'success',
        }"
      >
        {{ n.message }}
      </div>
    </div>
  </div>
</template>
