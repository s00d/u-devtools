import { ref, watch, onScopeDispose, type Ref } from 'vue';
import type { SyncedState } from '@u-devtools/core';

/**
 * Vue adapter for SyncedState.
 * Converts SyncedState to Vue ref with two-way synchronization.
 * 
 * @template T - State value type
 * @param syncedState - SyncedState instance to synchronize
 * @returns Vue ref synchronized with SyncedState
 * 
 * @example
 * ```typescript
 * import { useBridgeState } from '@u-devtools/kit/vue';
 * import { AppBridge } from '@u-devtools/core';
 * import { watch } from 'vue';
 * 
 * // Create bridge and state
 * const bridge = new AppBridge('my-plugin');
 * const isOpen = bridge.state('isOpen', false);
 * 
 * // Convert to Vue ref
 * const isOpenRef = useBridgeState(isOpen);
 * 
 * // Use as normal Vue ref
 * watch(isOpenRef, (value) => {
 *   console.log('Vue reactive:', value);
 * });
 * 
 * // Update
 * isOpenRef.value = true;
 * ```
 */
export function useBridgeState<T>(syncedState: SyncedState<T>): Ref<T> {
  const state = ref(syncedState.value) as Ref<T>;

  // Subscription: Core -> Vue
  const unsub = syncedState.subscribe((val) => {
    state.value = val;
  });

  // Sending: Vue -> Core
  watch(state, (newVal) => {
    syncedState.value = newVal;
  });

  onScopeDispose(() => unsub());
  return state;
}

