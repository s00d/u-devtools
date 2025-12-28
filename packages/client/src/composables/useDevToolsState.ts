import { ref, computed, shallowRef, type Ref, type ComputedRef, type ShallowRef } from 'vue';
import { useStorage } from '@vueuse/core';
import type { PluginClientInstance } from '@u-devtools/core';
import { plugins as rawPlugins } from 'virtual:u-devtools-plugins';
import { useNotifications } from './useNotifications';

// Глобальное состояние
const plugins = shallowRef<PluginClientInstance[]>(rawPlugins);
const activePluginId = ref<string>(plugins.value[0]?.name || 'internal:about');
const showSettings = ref(false);
const isPaletteOpen = ref(false);
const isSidebarExpanded = useStorage('u-devtools-sidebar-expanded', false);
const { notifications } = useNotifications();

// Вычисляемые свойства
const currentPlugin = computed(() => plugins.value.find((p) => p.name === activePluginId.value));
const isAboutActive = computed(() => activePluginId.value === 'internal:about');
const isManagerActive = computed(() => activePluginId.value === 'internal:plugins');

// Хелпер для закрытия
const closeDevTools = () => {
  window.parent.postMessage('u-devtools:close', '*');
};

export function useDevToolsState(): {
  plugins: ShallowRef<PluginClientInstance[]>;
  activePluginId: Ref<string>;
  showSettings: Ref<boolean>;
  isPaletteOpen: Ref<boolean>;
  isSidebarExpanded: ReturnType<typeof useStorage<boolean>>;
  currentPlugin: ComputedRef<PluginClientInstance | undefined>;
  isAboutActive: ComputedRef<boolean>;
  isManagerActive: ComputedRef<boolean>;
  closeDevTools: () => void;
  notifications: ReturnType<typeof useNotifications>['notifications'];
} {
  return {
    plugins,
    activePluginId,
    showSettings,
    isPaletteOpen,
    isSidebarExpanded,
    currentPlugin,
    isAboutActive,
    isManagerActive,
    closeDevTools,
    notifications
  };
}

