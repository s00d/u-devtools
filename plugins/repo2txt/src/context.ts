import { createDevToolsContext } from '@u-devtools/kit';
import type { AppBridge, ClientApi } from '@u-devtools/core';
import type { repo2txtProtocol } from './types';
import type { Toast } from '@u-devtools/overlay';

// 1. Create "raw" context
const { setupDevTools, useBridge: useRawBridge, useToast: useRawToast, useApi: useRawApi } = createDevToolsContext();

// 2. Export setup as is (it's used in client.ts and app.ts)
export { setupDevTools };

// 3. Export separate typed hooks
export function useBridge(): AppBridge<repo2txtProtocol> {
  return useRawBridge() as AppBridge<repo2txtProtocol>;
}

export function useToast(): Toast {
  return useRawToast();
}

export function useApi(): ClientApi {
  const api = useRawApi();
  if (!api) {
    throw new Error('[u-devtools] API not available in repo2txt context');
  }
  return api;
}

