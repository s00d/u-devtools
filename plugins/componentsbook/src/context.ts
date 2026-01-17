import { createDevToolsContext } from '@u-devtools/kit/context';
import type { AppBridge, ClientApi } from '@u-devtools/core';
import type { ComponentsbookProtocol } from './types';
import type { Toast } from '@u-devtools/overlay';

const {
  setupDevTools,
  useBridge: useRawBridge,
  useToast: useRawToast,
  useApi: useRawApi,
} = createDevToolsContext();

export { setupDevTools };

export function useBridge(): AppBridge<ComponentsbookProtocol> {
  return useRawBridge() as AppBridge<ComponentsbookProtocol>;
}

export function useToast(): Toast {
  return useRawToast();
}

export function useApi(): ClientApi {
  const api = useRawApi();
  if (!api) {
    throw new Error('[u-devtools] API not available in componentsbook context');
  }
  return api;
}

