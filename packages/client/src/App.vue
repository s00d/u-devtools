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

const { notifications, plugins, showSettings, isPaletteOpen } = useDevToolsState();

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

onMounted(() => window.addEventListener('keydown', onKeyDown));
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
</script>

<template>
  <div class="flex h-screen w-screen bg-white text-gray-800 font-sans overflow-hidden udt-reset dark:bg-gray-900 dark:text-gray-200">
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
