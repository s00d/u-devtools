import type { SyncedState } from '@u-devtools/core';

/**
 * Svelte Store interface (compatible with Svelte's store contract)
 */
export interface SvelteStore<T> {
  subscribe: (run: (value: T) => void) => () => void;
  set: (value: T) => void;
  update: (fn: (value: T) => T) => void;
}

/**
 * Svelte adapter for SyncedState.
 * Converts SyncedState to Svelte Writable Store.
 * Allows using $state syntax in Svelte components.
 * 
 * @template T - State value type
 * @param syncedState - SyncedState instance to synchronize
 * @returns Svelte store compatible with Svelte's store contract
 * 
 * @example
 * ```typescript
 * import { useBridgeState } from '@u-devtools/kit/svelte';
 * import { AppBridge } from '@u-devtools/core';
 * 
 * // Create bridge and state
 * const bridge = new AppBridge('my-plugin');
 * const isOpen = bridge.state('isOpen', false);
 * 
 * // Convert to Svelte store
 * const isOpenStore = useBridgeState(isOpen);
 * 
 * // In Svelte component:
 * // <button on:click={() => $isOpenStore = !$isOpenStore}>
 * //   {$isOpenStore ? 'Open' : 'Closed'}
 * // </button>
 * ```
 */
export function useBridgeState<T>(syncedState: SyncedState<T>): SvelteStore<T> {
  return {
    subscribe: (run: (value: T) => void) => {
      // Svelte requires calling run immediately on subscription
      // SyncedState.subscribe already does this
      const unsubscribe = syncedState.subscribe(run);
      return unsubscribe;
    },
    set: (value: T) => {
      syncedState.value = value;
    },
    update: (fn: (value: T) => T) => {
      syncedState.value = fn(syncedState.value);
    },
  };
}

