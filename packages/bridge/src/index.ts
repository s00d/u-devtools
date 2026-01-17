import { HmrTransport, WebSocketTransport, type Transport, validateRpcMessage } from '@u-devtools/core';
import { extractErrorMessage } from '@u-devtools/utils';

/**
 * Client-side RPC implementation (Browser)
 * Works through import.meta.hot with fallback to WebSocket
 * Uses Transport abstraction for communication
 */
export class ViteRpcClient {
  private transport: Transport | null = null;
  private preferredTransport: 'hmr' | 'websocket' = 'hmr';
  private wsUrl?: string;

  constructor(
    hot?: {
      send: (event: string, data: unknown) => void;
      on: (event: string, handler: (data: unknown) => void) => void;
      off?: (event: string, handler: (data: unknown) => void) => void;
    },
    wsUrl?: string
  ) {
    this.wsUrl = wsUrl || this.getDefaultWsUrl();

    // Try to use HMR if available
    if (hot) {
      try {
        this.transport = new HmrTransport(hot);
        this.preferredTransport = 'hmr';
      } catch (err) {
        console.warn('[ViteRpcClient] HMR transport failed, falling back to WebSocket:', err);
        this.fallbackToWebSocket();
      }
    } else {
      // HMR is not available, use WebSocket
      this.fallbackToWebSocket();
    }
  }

  private getDefaultWsUrl(): string {
    // Try to determine WebSocket server URL
    if (typeof window === 'undefined') {
      // Fallback for Node.js environments (tests, SSR)
      return 'ws://localhost:5173/__u-devtools-ws';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/__u-devtools-ws`;
  }

  private fallbackToWebSocket() {
    if (!this.wsUrl) {
      throw new Error('WebSocket URL is required when HMR is not available');
    }

    try {
      this.transport = new WebSocketTransport(this.wsUrl);
      this.preferredTransport = 'websocket';
    } catch (err) {
      throw new Error(`Failed to create WebSocket transport: ${err}`);
    }
  }

  /**
   * Call a method on the server
   * @param method - Method name to call
   * @param payload - Optional payload to send
   * @returns Promise with the method result
   */
  call<T = unknown>(method: string, payload?: unknown): Promise<T> {
    if (!this.transport) {
      return Promise.reject(new Error('Transport is not initialized'));
    }

    // If HMR is unavailable and WebSocket is not connected, try to reconnect
    if (
      this.preferredTransport === 'websocket' &&
      this.transport instanceof WebSocketTransport &&
      !this.transport.isConnected()
    ) {
      // Try to reconnect
      this.fallbackToWebSocket();
    }

    return this.transport.call<T>(method, payload);
  }

  /**
   * Subscribe to events (returns unsubscribe function)
   * @param event - Event name to subscribe to
   * @param fn - Event handler function
   * @returns Function to unsubscribe
   */
  on(event: string, fn: (data: unknown) => void): () => void {
    if (!this.transport) {
      return () => {};
    }
    return this.transport.on(event, fn);
  }

  /**
   * Unsubscribe from events
   * @param event - Event name to unsubscribe from
   * @param fn - Event handler function to remove
   */
  off(event: string, fn: (data: unknown) => void) {
    if (!this.transport) {
      return;
    }
    this.transport.off(event, fn);
  }

  /**
   * Clean up all handlers and subscriptions.
   * Should be called on HMR dispose to prevent memory leaks.
   */
  dispose() {
    if (this.transport) {
      this.transport.dispose();
    }
  }
}

/**
 * Server-side RPC implementation (Node.js)
 * Works through server.ws
 */
export class ViteRpcServer {
  private methods = new Map<string, (payload: unknown) => Promise<unknown> | unknown>();

  constructor(
    private ws: {
      on: (
        event: string,
        handler: (data: unknown, client: { send: (event: string, data: unknown) => void }) => void
      ) => void;
      send: (event: string, data: unknown) => void;
    }
  ) {
    // Listen for requests from client
    ws.on(
      'u-devtools:request',
      async (data: unknown, client: { send: (event: string, data: unknown) => void }) => {
        // Validate RPC message structure using Zod
        const msg = validateRpcMessage(data);
        if (!msg) {
          console.warn('[ViteRpcServer] Invalid RPC message structure:', data);
          client.send('u-devtools:response', {
            id: 'unknown',
            type: 'response',
            error: 'Invalid RPC message structure',
          });
          return;
        }
        const { id, method, payload } = msg;

        try {
          const methodName = method || '';
          const fn = this.methods.get(methodName);
          if (!fn) {
            console.error(`[ViteRpcServer] Method "${methodName}" not found`);
            throw new Error(`Method ${methodName} not found`);
          }

          const result = await fn(payload);

          // Send response to specific client
          client.send('u-devtools:response', {
            id,
            type: 'response',
            payload: result,
          });
        } catch (e) {
          const error = extractErrorMessage(e);
          client.send('u-devtools:response', {
            id,
            type: 'response',
            error,
          });
        }
      }
    );
  }

  /**
   * Register a method handler
   * @param method - Method name to handle
   * @param fn - Handler function
   */
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown) {
    this.methods.set(method, fn);
  }

  /**
   * Broadcast an event to all connected clients
   * @param event - Event name
   * @param payload - Optional event payload
   */
  broadcast(event: string, payload?: unknown) {
    this.ws.send('u-devtools:event', {
      id: Math.random().toString(36).substring(2, 15),
      type: 'event',
      method: event,
      payload,
    });
  }

  /**
   * Get the number of registered methods
   * @returns Number of registered methods
   */
  getMethodsCount(): number {
    return this.methods.size;
  }

  /**
   * Get list of all registered method names
   * @returns Array of method names
   */
  getMethods(): string[] {
    return Array.from(this.methods.keys());
  }
}
