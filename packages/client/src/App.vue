<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useDevToolsState } from './composables/useDevToolsState';
import { useLauncherMenu } from './composables/useLauncherMenu';
import { initDefaultSettings } from './modules/settings';

// Components
import ActivityBar from './components/shell/ActivityBar.vue';
import PluginSidebar from './components/shell/PluginSidebar.vue';
import MainView from './components/shell/MainView.vue';
import SettingsModal from './components/settings/SettingsModal.vue';
import CommandPalette from './components/CommandPalette.vue';
import GlobalDialogs from './components/GlobalDialogs.vue';

const { notifications, plugins, showSettings, isPaletteOpen } = useDevToolsState();

// Инициализация настроек
initDefaultSettings(plugins.value);

// Инициализация launcher menu
useLauncherMenu(plugins);

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

onMounted(() => window.addEventListener('keydown', onKeyDown));
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
</script>

<template>
  <!-- 
    Убираем жесткие цвета фона. 
    bg-transparent позволяет видеть цвет body, который мы настроили в CSS.
    text-gray-800 и dark:text... заменяем на text-[var(--udt-text)] или просто наследуем.
    Применяем масштаб и прозрачность через CSS переменные.
  -->
  <div 
    class="flex h-screen w-screen font-sans overflow-hidden udt-reset bg-[var(--udt-bg)] text-[var(--udt-text)] min-w-0 min-h-0"
    :style="{ 
      zoom: 'var(--udt-scale)',
      opacity: 'var(--udt-opacity)'
    }"
  >
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
  </div>
</template>

<style>
/* Global scrollbar hide utility */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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
