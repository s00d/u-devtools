import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi, RpcClientInterface } from '@u-devtools/core';
import { useNotifications } from '../composables/useNotifications';
import { createPluginStorage } from '../composables/usePluginStorage';
import { createSettingsApi } from './settings';
import { createShortcutApi } from './shortcuts';
import { createClipboardApi } from './clipboard';
import { createBusApi } from './bus';
import { createDialogApi } from './dialog';

// Заглушка RPC клиента для случаев, когда HMR недоступен
class NoopRpcClient implements RpcClientInterface {
  call<T = unknown>(_method: string, _payload?: unknown): Promise<T> {
    return Promise.reject(
      new Error('RPC is not available. DevTools requires Vite HMR to be enabled.')
    );
  }

  on(_event: string, _callback: (data: unknown) => void): () => void {
    return () => {
      // No-op unsubscribe
    };
  }

  off?(_event: string, _callback: (data: unknown) => void): void {
    // No-op
  }
}

// Инициализация RPC один раз
// Если HMR недоступен, используем заглушку (это может произойти при загрузке собранного клиента)
const rpc: RpcClientInterface = import.meta.hot
  ? new ViteRpcClient(import.meta.hot)
  : new NoopRpcClient();

const { notify } = useNotifications();

// Базовое API для системных компонентов
export const systemApi: ClientApi = {
  rpc,
  notify,
  storage: createPluginStorage('internal'),
  settings: createSettingsApi('internal'),
  shortcuts: createShortcutApi('internal'),
  clipboard: createClipboardApi(notify),
  bus: createBusApi(),
  dialog: createDialogApi(),
};

// Фабрика для плагинов
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
  };
}
