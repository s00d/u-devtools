import { Transport } from '../transport';
import type { RpcMessage } from '../index';

/**
 * Transport based on WebSocket
 * Used for communication between client and server when HMR is unavailable
 * (e.g., for remote debugging or production builds)
 */
export class WebSocketTransport extends Transport {
  private ws: WebSocket | null = null;

  // Reconnection
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null; // For cleanup
  private isManualClose = false;

  // Message queue (buffer)
  private messageQueue: string[] = [];

  constructor(private url: string) {
    super();
    this.connect();
  }

  private connect() {
    // Clear old socket if exists
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        console.log('[WebSocketTransport] Connected');
        this.flushQueue(); // Send queued messages
      };

      this.ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          // Call base class method for message routing
          this.handleMessage(data);
        } catch (err) {
          console.error('[WebSocketTransport] Failed to parse message:', err);
        }
      };

      this.ws.onerror = (error) => {
        // Connection errors often lead to onclose, so just log here
        console.error('[WebSocketTransport] Socket error:', error);
      };

      this.ws.onclose = (e) => {
        if (this.isManualClose) return;

        console.warn(`[WebSocketTransport] Closed (code: ${e.code}). Attempting reconnect...`);
        this.scheduleReconnect();
      };
    } catch (err) {
      console.error('[WebSocketTransport] Failed to create socket:', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts; // Exponential backoff (simple)

      console.log(`[WebSocketTransport] Reconnecting in ${delay}ms...`);

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('[WebSocketTransport] Max reconnect attempts reached');
    }
  }

  protected sendMessage(type: string, data: unknown): void {
    // Improvement 3: Form message more safely.
    // Assume Base Transport passes payload that needs to be wrapped,
    // OR Base Transport already passes a ready structure.
    // Better to standardize: Transport should pass a ready object for sending.

    // Let's form the packet here, as in original, but safer:
    const rawData = data as any;

    const message: RpcMessage = {
      id: rawData.id || '', // Fallback
      type: type as 'request' | 'event' | 'response', // Cast type safely
      method: rawData.method,
      payload: type === 'request' ? rawData.payload : rawData,
      error: rawData.error, // Don't forget errors
    };

    const serialized = JSON.stringify(message);

    if (this.isConnected()) {
      this.ws!.send(serialized);
    } else {
      // Improvement 2: Buffering
      this.messageQueue.push(serialized);
    }
  }

  private flushQueue() {
    if (!this.isConnected()) return;

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift();
      if (msg) this.ws!.send(msg);
    }
  }

  // Subscription methods not needed, as WS is a "pipe".
  // Base Transport class manages listener map itself,
  // and handleMessage distributes data.
  protected subscribe(_type: string, _handler: (data: unknown) => void): () => void {
    return () => {};
  }

  protected unsubscribe(_type: string, _handler: (data: unknown) => void): void {
    // No-op
  }

  override dispose() {
    this.isManualClose = true;

    // Improvement 1: Clear timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageQueue = []; // Clear memory
    super.dispose();
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
