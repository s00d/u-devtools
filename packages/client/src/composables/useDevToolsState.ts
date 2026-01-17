import { ref, computed, shallowRef, onMounted, type Ref, type ComputedRef, type ShallowRef } from 'vue';
import { useStorage } from '@vueuse/core';
import type { PluginClientInstance } from '@u-devtools/core';
import { plugins as rawPlugins } from 'virtual:u-devtools-plugins';
import { useNotifications } from './useNotifications';
import { systemApi, RPC_URL_KEY } from '../modules/clientApi';

// FIX: Check not just config existence, but wsUrl presence in it.
// In normal Vite mode, config exists but only contains { base: ... }
const globalConfig = (window as any).__UDEVTOOLS_CONFIG__;
// In Tauri/Electron mode, wsUrl is set and electronAPI exists
// In Tauri dev mode, import.meta.hot may be available, but we still use RPC
const isTauri = typeof (window as any).__TAURI_INTERNALS__ !== 'undefined';
const isElectron = typeof (window as any).electronAPI !== 'undefined';
// In Tauri/Electron mode, always use RPC, even if HMR is available
const isStandalone = isTauri || isElectron || !!localStorage.getItem(RPC_URL_KEY);

// Global state
// In standalone mode, plugins are loaded via RPC
// In Vite mode, plugins are loaded from virtual module
// If virtual module is empty but we're not in standalone, this might be connection to Vite dev server via custom URL
const plugins = shallowRef<PluginClientInstance[]>(isStandalone ? [] : (rawPlugins.length > 0 ? rawPlugins : []));
const activePluginId = ref<string>(plugins.value[0]?.name || 'internal:about');
const showSettings = ref(false);
const isPaletteOpen = ref(false);
const isSidebarExpanded = useStorage('u-devtools-sidebar-expanded', false);
const { notifications } = useNotifications();

// Flags to prevent duplicate loading
let isLoadingPlugins = false;
let pluginsLoaded = false;

// Add connection error state
const connectionError = ref<{ failed: boolean; url: string; error: string }>({
  failed: false,
  url: '',
  error: '',
});

// Load plugins via RPC (for Standalone or Remote mode)
async function loadPluginsStandalone() {
  // If we're NOT in standalone mode, exit immediately.
  // This prevents RPC call attempts in a regular browser.
  if (!isStandalone) {
    console.log('[DevTools] Not in standalone mode, skipping RPC load');
    return;
  }
  
  if (isLoadingPlugins || pluginsLoaded) return;
  
  isLoadingPlugins = true;
  connectionError.value.failed = false;
  
  try {
    console.log('[DevTools] Requesting plugins from RPC...');
    
    // Use main systemApi.rpc.
    // It's already configured in clientApi.ts (checks localStorage or config)
    const pluginList = await systemApi.rpc.call<Array<{ name: string; clientPath?: string; meta?: any }>>('sys:getPlugins');
    
    console.log('[DevTools] Plugins received:', pluginList);
    
    const loadedPlugins: PluginClientInstance[] = [];
    
    for (const pluginInfo of pluginList) {
      // Some plugins may not have a client part (server-only)
      // But we'll still try to load them if path exists
      if (!pluginInfo.clientPath) {
        console.warn(`[DevTools] Plugin ${pluginInfo.name} has no client path`);
        continue;
      }
      
      try {
        const importPath = pluginInfo.clientPath;
        
        console.log(`[DevTools] Importing plugin ${pluginInfo.name} from: ${importPath}`);
        
        // IMPORTANT: Allow any paths.
        // Vite Dev Server will correctly handle /@fs/, /src/ and relative paths.
        const pluginModule = await import(/* @vite-ignore */ importPath);
        const pluginInstance = pluginModule.default || pluginModule;
        
        if (pluginInstance && typeof pluginInstance === 'object' && 'name' in pluginInstance) {
          loadedPlugins.push(pluginInstance as PluginClientInstance);
          console.log(`[DevTools] ✅ Successfully loaded plugin ${pluginInfo.name}`);
        } else {
          console.warn(`[DevTools] Plugin ${pluginInfo.name} loaded but invalid structure`);
        }
      } catch (error) {
        console.error(`[DevTools] Failed to load plugin ${pluginInfo.name} from ${pluginInfo.clientPath}:`, error);
      }
    }
    
    plugins.value = loadedPlugins;
    pluginsLoaded = true;
    console.log(`[DevTools] Successfully loaded ${loadedPlugins.length} plugins`);
    
    // Force update active plugin
    if (loadedPlugins.length > 0) {
      // If route says "about" but we have plugins - switch to first
      // Or if current active ID is default
      if (activePluginId.value === 'internal:about') {
        activePluginId.value = loadedPlugins[0].name;
      }
    }
  } catch (error) {
    console.error('[DevTools] Fatal error loading plugins:', error);
    
    // Get current URL from config or LS
    const customUrl = localStorage.getItem(RPC_URL_KEY);
    // Priority: Config -> LS -> Default
    const currentUrl = globalConfig?.customRpcUrl || customUrl || globalConfig?.wsUrl || 'ws://localhost:3000/ws';

    connectionError.value = {
      failed: true,
      url: currentUrl,
      error: error instanceof Error ? error.message : String(error),
    };

    notifications.value.push({
      id: Date.now(),
      type: 'error',
      message: 'Failed to connect to DevTools server.'
    });
  } finally {
    isLoadingPlugins = false;
  }
}

// Computed properties
const currentPlugin = computed(() => plugins.value.find((p) => p.name === activePluginId.value));
const isAboutActive = computed(() => activePluginId.value === 'internal:about');
const isManagerActive = computed(
  () => activePluginId.value === 'Plugins' || activePluginId.value === 'internal:plugins'
);

// Helper for syncing state with router
export function syncStateWithRoute(pluginName: string) {
  activePluginId.value = pluginName;
}

// Helper for closing
const closeDevTools = () => {
  window.parent.postMessage('u-devtools:close', '*');
};

// In Vite mode, plugins are loaded from virtual module at build time
// Custom URL only changes transport (WebSocket instead of HMR), not plugin loading method
// If virtual module is empty, it means Vite plugin is not configured or contains no plugins

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
  connectionError: Ref<{ failed: boolean; url: string; error: string }>;
} {
  // Load plugins on mount
  onMounted(() => {
    // In normal mode (isStandalone === false), this block won't execute,
    // and plugins will be taken from virtual:u-devtools-plugins
    // But if there are no plugins from virtual module, try loading via RPC
    console.log('[DevTools] onMounted - isStandalone:', isStandalone, 'isTauri:', isTauri, 'isElectron:', isElectron, 'plugins count:', plugins.value.length, 'config:', globalConfig);
    if (isStandalone || plugins.value.length === 0) {
      // Small delay to let server start and WebSocket connect
      setTimeout(() => {
        console.log('[DevTools] Attempting to load plugins, isStandalone:', isStandalone);
        loadPluginsStandalone();
      }, 1000);
    }
  });
  
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
    notifications,
    connectionError,
  };
}
