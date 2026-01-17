import { useSyncExternalStore } from 'react';
import type { SyncedState } from '@u-devtools/core';

/**
 * React adapter for SyncedState.
 * Converts SyncedState to React state with two-way synchronization.
 * 
 * @template T - State value type
 * @param syncedState - SyncedState instance to synchronize
 * @returns Tuple [value, setValue] for use in React components
 * 
 * @example
 * ```typescript
 * import { useBridgeState } from '@u-devtools/kit/react';
 * import { AppBridge } from '@u-devtools/core';
 * 
 * // Create bridge and state
 * const bridge = new AppBridge('my-plugin');
 * const isOpen = bridge.state('isOpen', false);
 * 
 * // In component
 * function MyComponent() {
 *   const [isOpenValue, setIsOpen] = useBridgeState(isOpen);
 *   
 *   // Use isOpenValue and setIsOpen in your component
 *   return <div>{isOpenValue ? 'ON' : 'OFF'}</div>;
 * }
 * ```
 */
export function useBridgeState<T>(syncedState: SyncedState<T>): [T, (value: T) => void] {
  // Use useSyncExternalStore to synchronize with external state
  const value = useSyncExternalStore(
    (callback) => syncedState.subscribe(callback),
    () => syncedState.value,
    () => syncedState.value
  );

  // Create setter that updates SyncedState
  const setValue = (newValue: T) => {
    syncedState.value = newValue;
  };

  return [value, setValue];
}

