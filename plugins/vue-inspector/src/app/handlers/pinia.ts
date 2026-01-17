import { devtools } from '@vue/devtools-kit';
import type { AppBridge } from '@u-devtools/core';
import type { VueInspectorProtocol, CustomInspectorState } from '../../types';

export function registerPiniaHandlers(
  bridge: AppBridge<VueInspectorProtocol>,
  checkConnection: () => boolean,
  hasPinia: () => boolean
) {
  
  // --- PINIA TREE ---
  bridge.on('inspector:getPiniaTree', (payload: Parameters<VueInspectorProtocol['inspector:getPiniaTree']>[0]) => {
    (async () => {
      if (!checkConnection()) {
        bridge.send('inspector:piniaTree', []);
        return;
      }
      try {
        const tree = await devtools.ctx.api.getInspectorTree({
          inspectorId: 'pinia',
          filter: payload.filter || '',
        });
        bridge.send('inspector:piniaTree', (tree || []) as Parameters<VueInspectorProtocol['inspector:piniaTree']>[0]);
      } catch (e) {
        // Pinia may not be installed
        bridge.send('inspector:piniaTree', []);
      }
    })();
  });

  // --- PINIA STATE ---
  bridge.on('inspector:getPiniaState', (payload: Parameters<VueInspectorProtocol['inspector:getPiniaState']>[0]) => {
    (async () => {
      if (!checkConnection()) {
        bridge.send('inspector:piniaState', {} as Record<string, never>);
        return;
      }
      try {
        const state = await devtools.ctx.api.getInspectorState({
          inspectorId: 'pinia',
          nodeId: payload.nodeId,
        });
        
        // Convert state to Record<string, CustomInspectorState[]>
        // getInspectorState returns an object with 'state' property containing CustomInspectorState[]
        const stateRecord: Record<string, CustomInspectorState[]> = state && typeof state === 'object' && state !== null && 'state' in state
          ? { state: Array.isArray((state as any).state) ? (state as any).state as CustomInspectorState[] : [(state as any).state as CustomInspectorState] }
          : ({} as Record<string, never>);
        
        bridge.send('inspector:piniaState', stateRecord);
      } catch (e) {
        // Pinia may not be installed
        bridge.send('inspector:piniaState', {} as Record<string, never>);
      }
    })();
  });

  // --- EDIT PINIA STATE ---
  bridge.on('inspector:editPiniaState', (payload: Parameters<VueInspectorProtocol['inspector:editPiniaState']>[0]) => {
    (async () => {
      if (!checkConnection() || !hasPinia()) return;
      try {
        // The API will add app and set function automatically
        devtools.ctx.api.editInspectorState({
          inspectorId: 'pinia',
          nodeId: payload.nodeId,
          path: payload.path,
          state: {
            value: payload.value,
          } as any, // Type assertion needed as API adds app and set internally
          type: payload.type,
        } as any);
        // Refresh state after edit
        const state = await devtools.ctx.api.getInspectorState({
          inspectorId: 'pinia',
          nodeId: payload.nodeId,
        });
        
        // Convert state to Record<string, CustomInspectorState[]>
        const stateRecord: Record<string, CustomInspectorState[]> = state && typeof state === 'object' && state !== null && 'state' in state
          ? { state: Array.isArray((state as any).state) ? (state as any).state as CustomInspectorState[] : [(state as any).state as CustomInspectorState] }
          : ({} as Record<string, never>);
        
        bridge.send('inspector:piniaState', stateRecord);
      } catch (e) {
        console.error(
          `[Vue Inspector] editPiniaState error: ${e instanceof Error ? e.message : String(e)}`
        );
      }
    })();
  });
}

