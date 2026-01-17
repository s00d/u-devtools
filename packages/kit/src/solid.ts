import { createSignal, onCleanup } from 'solid-js';
import type { SyncedState } from '@u-devtools/core';

/**
 * Solid adapter for SyncedState.
 * Converts SyncedState to Solid signal with two-way synchronization.
 * 
 * @template T - State value type
 * @param syncedState - SyncedState instance to synchronize
 * @returns Solid signal synchronized with SyncedState
 * 
 * @example
 * ```typescript
 * import { useBridgeState } from '@u-devtools/kit/solid';
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
 *   // Use isOpenValue() and setIsOpen in your component
 *   return <div>{isOpenValue() ? 'ON' : 'OFF'}</div>;
 * }
 * ```
 */
export function useBridgeState<T>(syncedState: SyncedState<T>): [() => T, (value: T) => void] {
  const [value, setValue] = createSignal(syncedState.value);

  // Subscription: Core -> Solid
  const unsub = syncedState.subscribe((val) => {
    setValue(() => val);
  });

  // Sending: Solid -> Core
  const setSyncedValue = (newValue: T) => {
    syncedState.value = newValue;
    setValue(() => newValue);
  };

  onCleanup(() => unsub());

  return [value, setSyncedValue];
}

