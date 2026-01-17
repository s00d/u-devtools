import { BroadcastTransport } from './transports/broadcast-transport';

/**
 * Universal state class with automatic synchronization between App and Client contexts.
 * Implements "Handshake" protocol for getting current data on initialization.
 * 
 * Use this for state that needs to be shared between App context (main window) 
 * and Client context (DevTools iframe). Changes are automatically synchronized.
 * 
 * @template T - Type of the state value
 * 
 * @example
 * ```typescript
 * import { AppBridge } from '@u-devtools/core';
 * 
 * // Create bridge
 * const bridge = new AppBridge('my-plugin');
 * 
 * // Create synced state
 * const isOpen = bridge.state('isOpen', false);
 * const count = bridge.state('count', 0);
 * 
 * // Update value (automatically syncs to Client)
 * isOpen.value = true;
 * count.value = 42;
 * 
 * // Subscribe to changes
 * const unsubscribe = isOpen.subscribe((value) => {
 *   console.log('State changed:', value);
 * });
 * 
 * // Cleanup
 * unsubscribe();
 * ```
 */
export class SyncedState<T> {
  private _value: T;
  private listeners = new Set<(val: T) => void>();
  private isUpdating = false;

  constructor(
    private bridge: AppBridge<any>,
    private key: string,
    initialValue: T
  ) {
    this._value = initialValue;
    
    const syncEvent = `sync:${key}`;
    const requestEvent = `request:${key}`; // Event for requesting current state

    // 1. Listen for updates (SYNC)
    this.bridge.on(syncEvent, ((data: unknown) => {
      // Ignore echo (if we sent it ourselves)
      if (this.isUpdating) return;

      const newValue = data as T;
      if (this._value !== newValue) {
        this._value = newValue;
        this.isUpdating = true; // Block sending back to prevent loop
        this.notify();
        this.isUpdating = false;
      }
    }) as (data: unknown) => void);

    // 2. Listen for state requests (HANDSHAKE RESPONSE)
    // If the other side (e.g., panel) just opened, it will ask for current value.
    // We must respond with our current value.
    this.bridge.on(requestEvent, () => {
      // Send current value to all who asked
      this.bridge.send(syncEvent, this._value);
    });

    // 3. Request current state (HANDSHAKE REQUEST)
    // Right after creation, ask: "Hey, what's the current value?"
    // This is critical if we loaded later than the other side.
    this.bridge.send(requestEvent, {});
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (this._value !== newValue) {
      this._value = newValue;
      // Notify local subscribers
      this.notify();
      
      // Send to bridge if this is not an "incoming" change
      if (!this.isUpdating) {
        this.bridge.send(`sync:${this.key}`, newValue);
      }
    }
  }

  subscribe = (fn: (val: T) => void): () => void => {
    this.listeners.add(fn);
    fn(this._value);
    return () => {
      this.listeners.delete(fn);
    };
  }

  getSnapshot = (): T => {
    return this._value;
  }

  private notify() {
    this.listeners.forEach((fn) => {
      fn(this._value);
    });
  }
}

/**
 * AppBridge - Typed communication bridge between App context (main window) and Client context (DevTools iframe).
 * 
 * Communication: App ↔ Client via BroadcastChannel API
 * 
 * Provides type-safe event-based communication with automatic state synchronization.
 * 
 * @template Protocol - Type definition for events and their handlers
 * 
 * @example
 * ```typescript
 * import { AppBridge } from '@u-devtools/core';
 * 
 * // Define protocol for type-safe communication
 * interface MyPluginProtocol {
 *   'element-selected': (data: { id: string; html: string }) => void;
 *   'toggle-inspector': (data: { state: boolean }) => void;
 * }
 * 
 * const typedBridge = new AppBridge<MyPluginProtocol>('my-plugin');
 * 
 * // Send events (type-safe)
 * typedBridge.send('element-selected', { id: 'el-1', html: '<div>...</div>' });
 * 
 * // Listen to events (type-safe)
 * typedBridge.on('toggle-inspector', ({ state }) => {
 *   // state is automatically typed as { state: boolean }
 *   console.log('Inspector toggled:', state);
 * });
 * 
 * // Create synced state
 * const selectedElement = typedBridge.state<HTMLElement | null>('selectedElement', null);
 * selectedElement.value = document.getElementById('my-element');
 * ```
 */
export class AppBridge<Protocol = Record<string, (...args: any[]) => any>> {
  private transport: BroadcastTransport;
  public namespace: string; // Normalized name for bridge (lowercase)
  public displayName: string; // Original name for UI

  constructor(namespace: string) {
    // Normalize namespace to lowercase and replace spaces with dashes for BroadcastChannel compatibility
    // but keep original name for UI display
    this.namespace = namespace.toLowerCase().replace(/\s+/g, '-');
    this.displayName = namespace;
    this.transport = new BroadcastTransport(this.namespace);
  }

  send<K extends keyof Protocol>(
    event: K,
    ...args: Protocol[K] extends (...args: infer P) => any ? P : []
  ): void {
    const payload = args.length === 1 ? args[0] : args.length > 1 ? args : undefined;
    this.transport.send(event as string, payload);
  }

  on<K extends keyof Protocol>(
    event: K,
    cb: Protocol[K] extends (...args: any[]) => any
      ? (data: Parameters<Protocol[K]>[0]) => void
      : never
  ): () => void {
    return this.transport.on(event as string, cb as (data: unknown) => void);
  }

  request<RequestData, ResponseData>(
    requestEvent: string,
    requestData: RequestData,
    responseEvent: string,
    timeout = 5000,
    responseFilter?: (request: RequestData, response: ResponseData) => boolean
  ): Promise<ResponseData> {
    return new Promise<ResponseData>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Request timeout: ${requestEvent} -> ${responseEvent}`));
      }, timeout);

      const unsubscribe = this.transport.on(responseEvent, (data: unknown) => {
        const response = data as ResponseData;
        if (responseFilter && !responseFilter(requestData, response)) {
          return;
        }
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(response);
      });

      this.transport.send(requestEvent, requestData);
    });
  }

  close() {
    this.transport.close();
  }

  state<T>(key: string, initialValue: T): SyncedState<T> {
    return new SyncedState(this, key, initialValue);
  }
}
