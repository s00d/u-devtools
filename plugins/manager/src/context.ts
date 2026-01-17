import { createDevToolsContext } from '@u-devtools/kit';
import type { AppBridge, ClientApi } from '@u-devtools/core';
import type { Toast } from '@u-devtools/overlay';

// 1. Создаем "сырой" контекст
const { setupDevTools, useBridge: useRawBridge, useToast: useRawToast, useApi: useRawApi } = createDevToolsContext();

// 2. Экспортируем setup как есть (он используется в client.ts)
export { setupDevTools };

// 3. Экспортируем отдельные типизированные хуки
// manager плагин не использует bridge для событий (только RPC), но для единообразия создаем хук
export function useBridge(): AppBridge<Record<string, never>> {
  return useRawBridge() as AppBridge<Record<string, never>>;
}

export function useToast(): Toast {
  return useRawToast();
}

export function useApi(): ClientApi {
  const api = useRawApi();
  if (!api) {
    throw new Error('[u-devtools] API not available in manager context');
  }
  return api;
}

