import { ViteRpcClient } from '@u-devtools/bridge';
import type { ClientApi } from '@u-devtools/core';
import { useNotifications } from '../composables/useNotifications';
import { createPluginStorage } from '../composables/usePluginStorage';
import { createSettingsApi } from './settings';
import { createShortcutApi } from './shortcuts';
import { createClipboardApi } from './clipboard';
import { createBusApi } from './bus';
import { createDialogApi } from './dialog';

// Инициализация RPC один раз
if (!import.meta.hot) throw new Error('Vite HMR required');
const rpc = new ViteRpcClient(import.meta.hot);
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
