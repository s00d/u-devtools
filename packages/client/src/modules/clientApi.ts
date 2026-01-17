import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi, RpcClientInterface, NavigationApi } from '@u-devtools/core';
import { useNotifications } from '../composables/useNotifications';
import { createPluginStorage } from '../composables/usePluginStorage';
import { createSettingsApi } from './settings';
import { createShortcutApi } from './shortcuts';
import { createClipboardApi } from './clipboard';
import { createBusApi } from './bus';
import { createDialogApi } from './dialog';
import { useDevToolsState } from '../composables/useDevToolsState';
import router from '../router';

// Key for storing custom RPC URL
export const RPC_URL_KEY = 'u-devtools-custom-rpc-url'; // WebSocket URL for RPC connection

function createRpcClient(): RpcClientInterface {
  const globalConfig = (window as any).__UDEVTOOLS_CONFIG__;

  // Check if we're in Tauri/Electron mode
  const isTauri = typeof (window as any).__TAURI_INTERNALS__ !== 'undefined';
  const isElectron = typeof (window as any).electronAPI !== 'undefined';

  // 1. Priority: Custom URL from settings (Electron Saved or LocalStorage)
  if (globalConfig?.customRpcUrl) {
    console.log('[ClientApi] 🔌 Mode: Custom URL ->', globalConfig.customRpcUrl);
    return new ViteRpcClient(undefined, globalConfig.customRpcUrl);
  }

  const lsUrl = localStorage.getItem(RPC_URL_KEY);
  if (lsUrl) {
    console.log('[ClientApi] 🔌 Mode: LocalStorage ->', lsUrl);
    return new ViteRpcClient(undefined, lsUrl);
  }

  // 2. In Tauri/Electron mode always use WebSocket
  if (isTauri || isElectron) {
    const wsUrl = globalConfig?.wsUrl || 'ws://localhost:3000/ws';
    console.log('[ClientApi] 🔌 Mode: Tauri/Electron ->', wsUrl);
    return new ViteRpcClient(undefined, wsUrl);
  }

  // 3. Priority: Electron Default (ws://localhost:3000)
  // IMPORTANT: This must be BEFORE import.meta.hot check
  if (globalConfig?.wsUrl) {
    console.log('[ClientApi] 🔌 Mode: Config wsUrl ->', globalConfig.wsUrl);
    // Pass undefined instead of hot to force WebSocket
    return new ViteRpcClient(undefined, globalConfig.wsUrl);
  }

  // 4. Vite HMR (Regular browser)
  if (import.meta.hot) {
    console.log('[ClientApi] 🔌 Mode: Vite HMR');
    return new ViteRpcClient(import.meta.hot);
  }

  // 5. Fallback
  console.log('[ClientApi] 🔌 Mode: Auto WebSocket');
  return new ViteRpcClient(undefined, undefined);
}

// Initialize RPC
const rpc: RpcClientInterface = createRpcClient();

// Cleanup on HMR dispose (only if we're using HMR transport)
if (import.meta.hot && !localStorage.getItem(RPC_URL_KEY) && !((window as any).__UDEVTOOLS_CONFIG__?.wsUrl)) {
  import.meta.hot.dispose(() => {
    if (rpc instanceof ViteRpcClient) {
      rpc.dispose();
    }
  });
}

// === IMPROVED: Health Check ===
// Only if we're in browser and using WebSocket (not HMR)
if (rpc instanceof ViteRpcClient && !import.meta.hot) {
  let consecutiveFailures = 0;

  // Ping server every 2 seconds
  setInterval(async () => {
    try {
      // Try to get headers of current page
      // In Electron/Remote mode this will check server availability
      await fetch(window.location.href, { method: 'HEAD', cache: 'no-store' });
      consecutiveFailures = 0;
    } catch (e) {
      consecutiveFailures++;
      console.warn(`[Client] Server check failed (${consecutiveFailures}/3)`);

      // If failed 3 times in a row - server is down
      if (consecutiveFailures >= 3) {
        console.log('[Client] Connection lost. Reloading to trigger fallback screen...');
        // Reload will trigger network error -> Electron will catch it -> show renderer.html
        window.location.reload();
      }
    }
  }, 2000);
}

const { notify } = useNotifications();

// Create Navigation API
const navigation: NavigationApi = {
  openPlugin(name: string) {
    // Settings remains a modal
    if (name === 'settings') {
      const { showSettings } = useDevToolsState();
      showSettings.value = true;
      return;
    }

    // About page
    if (name === 'about' || name === 'internal:about') {
      router.push('/about').catch((_err) => {});
      return;
    }

    // Plugin Manager
    if (name === 'Plugins' || name === 'internal:plugins') {
      router.push('/plugins/Plugins').catch((_err) => {});
      return;
    }

    // Regular plugins
    router.push({ name: 'plugin', params: { pluginName: name } }).catch((_err) => {});
  },
};

// Base API for system components
export const systemApi: ClientApi = {
  rpc,
  notify,
  storage: createPluginStorage('internal'),
  settings: createSettingsApi('internal'),
  shortcuts: createShortcutApi('internal'),
  clipboard: createClipboardApi(notify),
  bus: createBusApi(),
  dialog: createDialogApi(),
  navigation,
};

// Factory for plugins
export function createApiForPlugin(pluginName: string): ClientApi {
  return {
    rpc,
    notify,
    storage: createPluginStorage(pluginName),
    settings: createSettingsApi(pluginName),
    shortcuts: createShortcutApi(pluginName),
    clipboard: createClipboardApi(notify),
    bus: createBusApi(),
    dialog: createDialogApi(),
    navigation,
  };
}
