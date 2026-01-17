import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { SyncedState } from '@u-devtools/core';

/**
 * Lit adapter for SyncedState.
 * Works as a Reactive Controller.
 * Automatically calls requestUpdate() on component when state changes.
 * 
 * @template T - State value type
 * 
 * @example
 * ```typescript
 * import { useBridgeState } from '@u-devtools/kit/lit';
 * import { useDevTools } from './context';
 * 
 * class MyElement extends LitElement {
 *   private bridge = useDevTools().bridge;
 *   private isOpen = useBridgeState(this, this.bridge.state('isOpen', false));
 * 
 *   render() {
 *     return html`
 *       <button @click=${() => this.isOpen.value = !this.isOpen.value}>
 *         ${this.isOpen.value ? 'Open' : 'Closed'}
 *       </button>
 *     `;
 *   }
 * }
 * ```
 */
export class BridgeStateController<T> implements ReactiveController {
  private _cleanup?: () => void;

  constructor(
    protected host: ReactiveControllerHost,
    protected syncedState: SyncedState<T>
  ) {
    host.addController(this);
  }

  hostConnected() {
    this._cleanup = this.syncedState.subscribe(() => {
      this.host.requestUpdate();
    });
  }

  hostDisconnected() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = undefined;
    }
  }

  get value(): T {
    return this.syncedState.value;
  }

  set value(v: T) {
    this.syncedState.value = v;
  }
}

/**
 * Helper for creating controller (for convenience)
 * 
 * @template T - State value type
 * @param host - ReactiveControllerHost (usually LitElement)
 * @param syncedState - SyncedState instance to synchronize
 * @returns BridgeStateController instance
 * 
 * @example
 * ```typescript
 * class MyElement extends LitElement {
 *   private isOpen = useBridgeState(this, bridge.state('isOpen', false));
 * }
 * ```
 */
export function useBridgeState<T>(
  host: ReactiveControllerHost,
  syncedState: SyncedState<T>
): BridgeStateController<T> {
  return new BridgeStateController(host, syncedState);
}

