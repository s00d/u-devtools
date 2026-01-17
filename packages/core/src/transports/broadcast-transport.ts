import { Transport } from '../transport';

/**
 * Transport based on BroadcastChannel
 * Used for communication between App (window) and Client (iframe)
 * Does not support RPC (call), only events (send/on)
 */
export class BroadcastTransport extends Transport {
  private channel: BroadcastChannel;
  private messageHandler?: (e: MessageEvent) => void;
  private namespace: string;

  constructor(namespace: string) {
    super();
    this.namespace = namespace;
    this.channel = new BroadcastChannel(`u-devtools:${namespace}`);

    this.messageHandler = (e: MessageEvent) => {
      const { event, data } = e.data as { event: string; data: unknown };
      // BroadcastChannel is only used for events, not for RPC
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.forEach((fn) => {
          fn(data);
        });
      }
    };

    this.channel.onmessage = this.messageHandler;
  }

  /**
   * Extract values from Vue reactive objects (ref, computed, reactive)
   */
  private unwrapVueReactive(value: unknown): unknown {
    // Check if this is a Vue ref/computed
    if (value && typeof value === 'object') {
      // Vue 3 ref/computed have __v_isRef or _value property
      if ('__v_isRef' in value || '_value' in value) {
        const refValue = (value as { _value?: unknown; value?: unknown })._value ?? (value as { value?: unknown }).value;
        return this.unwrapVueReactive(refValue);
      }
      // Vue reactive objects may have circular references
      if (Array.isArray(value)) {
        return value.map(item => this.unwrapVueReactive(item));
      }
      // Regular objects - process recursively
      const result: Record<string, unknown> = {};
      const seen = new WeakSet();
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const val = (value as Record<string, unknown>)[key];
          // Skip circular references and Vue internal properties
          if (key.startsWith('__') || key.startsWith('_') && key !== '_value') {
            continue;
          }
          if (val && typeof val === 'object') {
            if (seen.has(val as object)) {
              result[key] = '[Circular]';
              continue;
            }
            seen.add(val as object);
          }
          result[key] = this.unwrapVueReactive(val);
        }
      }
      return result;
    }
    return value;
  }

  /**
   * Send event (not RPC)
   */
  send(event: string, data?: unknown): void {
    try {
      // Extract values from Vue reactive objects before sending
      const serializableData = data !== undefined ? this.unwrapVueReactive(data) : undefined;
      this.channel.postMessage({ event, data: serializableData });
    } catch (e) {
      // Ignore errors if channel is closed
      if (
        e instanceof DOMException &&
        (e.name === 'InvalidStateError' || e.message?.includes('closed'))
      ) {
        console.warn(`[BroadcastTransport:${this.namespace}] Cannot send event "${event}": channel is closed`);
        return;
      }
      
      // DataCloneError - add detailed information
      if (e instanceof Error && (e.name === 'DataCloneError' || e.message?.includes('circular'))) {
        const stack = new Error().stack;
        const dataType = data === null ? 'null' : data === undefined ? 'undefined' : typeof data;
        let dataPreview = '';
        try {
          dataPreview = typeof data === 'object' && data !== null 
            ? JSON.stringify(data, (key, value) => {
                if (typeof value === 'function') return '[Function]';
                if (value instanceof Node) return `[${value.nodeName}]`;
                if (value instanceof Error) return `[Error: ${value.message}]`;
                // Skip Vue internal properties
                if (key.startsWith('__') || (key.startsWith('_') && key !== '_value')) return undefined;
                return value;
              }, 2).slice(0, 200)
            : String(data).slice(0, 100);
        } catch {
          dataPreview = '[Unable to serialize]';
        }
        
        console.error(
          `[BroadcastTransport:${this.namespace}] DataCloneError: Failed to send event "${event}".\n` +
          `Data type: ${dataType}\n` +
          `Data preview: ${dataPreview}\n` +
          `This usually means the data contains non-serializable objects (functions, DOM nodes, Vue refs, etc.).\n` +
          `Stack trace:\n${stack?.split('\n').slice(0, 5).join('\n') || 'N/A'}`
        );
        return; // Don't throw error, just log
      }
      
      throw e;
    }
  }

  /**
   * RPC calls are not supported in BroadcastChannel
   */
  override call<T = unknown>(_method: string, _payload?: unknown): Promise<T> {
    return Promise.reject(
      new Error('RPC calls are not supported in BroadcastTransport. Use send() for events.')
    );
  }

  protected sendMessage(_type: string, _data: unknown): void {
    // BroadcastChannel does not support RPC
    throw new Error('sendMessage is not supported in BroadcastTransport. Use send() instead.');
  }

  protected subscribe(event: string, handler: (data: unknown) => void): () => void {
    // Subscription is already handled via messageHandler
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(handler);
    }
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(handler);
      }
    };
  }

  protected unsubscribe(event: string, handler: (data: unknown) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(handler);
    }
  }

  override dispose() {
    super.dispose();
    this.channel.close();
  }

  /**
   * Close channel (alias for dispose)
   */
  close() {
    this.dispose();
  }
}
