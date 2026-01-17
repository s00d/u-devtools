import type { RpcMessage } from './index';
import { validateRpcMessage } from './schemas/rpc';
import { extractErrorMessage } from '@u-devtools/utils';

/**
 * Unique ID generator for RPC requests
 */
const uuid = () => Math.random().toString(36).substring(2, 15);

/**
 * Abstract class for message transport.
 * Provides common logic for RPC calls and event subscriptions.
 */
export abstract class Transport {
  protected handlers = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  protected eventListeners = new Map<string, Set<(data: unknown) => void>>();
  protected disposed = false;
  protected timeout = 5000; // Default timeout

  /**
   * Send a message through the transport
   */
  protected abstract sendMessage(type: string, data: unknown): void;

  /**
   * Subscribe to messages from the transport
   */
  protected abstract subscribe(type: string, handler: (data: unknown) => void): () => void;

  /**
   * Unsubscribe from transport messages
   */
  protected abstract unsubscribe?(type: string, handler: (data: unknown) => void): void;

  /**
   * RPC method call
   */
  call<T = unknown>(method: string, payload?: unknown): Promise<T> {
    if (this.disposed) {
      return Promise.reject(new Error('Transport has been disposed'));
    }

    const id = uuid();
    return new Promise<T>((resolve, reject) => {
      this.handlers.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });

      // Send request
      this.sendMessage('request', { id, type: 'request', method, payload });

      // Timeout
      setTimeout(() => {
        const handler = this.handlers.get(id);
        if (handler) {
          this.handlers.delete(id);
          const error = new Error(`RPC Timeout: ${method}`);
          console.error('[RPC Timeout]', {
            method,
            payload,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          });
          handler.reject(error);
        }
      }, this.timeout);
    });
  }

  /**
   * Subscribe to events
   */
  on(event: string, fn: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)?.add(fn);

    // Subscribe to transport events
    const unsubscribe = this.subscribe('event', (data: unknown) => {
      const msg = data as RpcMessage;
      if (msg.method === event) {
        fn(msg.payload);
      }
    });

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(fn);
      }
      unsubscribe();
    };
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, fn: (data: unknown) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(fn);
    }
  }

  /**
   * Handle incoming messages (called by transport)
   */
  protected handleMessage(data: unknown) {
    if (this.disposed) return;

    // Validate message structure using Zod
    const msg = validateRpcMessage(data);
    if (!msg) {
      console.warn('[Transport] Invalid RPC message structure:', data);
      return;
    }

    // Handle RPC responses
    if (msg.type === 'response') {
      const handler = this.handlers.get(msg.id);
      if (handler) {
        if (msg.error) {
          // Extract error message using utility function
          const errorMessage = extractErrorMessage(msg.error);
          handler.reject(new Error(errorMessage));
        } else {
          handler.resolve(msg.payload);
        }
        this.handlers.delete(msg.id);
      }
      return;
    }

    // Handle events
    if (msg.type === 'event') {
      const method = msg.method || '';
      const listeners = this.eventListeners.get(method);
      if (listeners && listeners.size > 0) {
        for (const fn of listeners) {
          try {
            fn(msg.payload);
          } catch (err) {
            console.error('[Transport] Error in listener:', err);
          }
        }
      }
    }
  }

  /**
   * Clean up all handlers and subscriptions
   */
  dispose() {
    this.disposed = true;

    // Reject all pending requests
    for (const [id, handler] of this.handlers.entries()) {
      handler.reject(new Error(`Transport disposed: request ${id} was cancelled`));
    }
    this.handlers.clear();

    // Clear all event subscriptions
    this.eventListeners.clear();
  }
}
