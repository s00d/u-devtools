import { Transport } from '../transport';

/**
 * Transport based on Vite HMR (Hot Module Replacement)
 * Used for communication between client (iframe) and server (Node.js)
 */
export class HmrTransport extends Transport {
  private responseHandler?: (data: unknown) => void;
  private eventHandler?: (data: unknown) => void;

  constructor(
    private hot: {
      send: (event: string, data: unknown) => void;
      on: (event: string, handler: (data: unknown) => void) => void;
      off?: (event: string, handler: (data: unknown) => void) => void;
    }
  ) {
    super();
    if (!hot) throw new Error('Hot Module Replacement is required for HmrTransport');

    // Listen for responses from server
    this.responseHandler = (data: unknown) => {
      this.handleMessage(data);
    };
    hot.on('u-devtools:response', this.responseHandler);

    // Listen for events from server
    this.eventHandler = (data: unknown) => {
      this.handleMessage(data);
    };
    hot.on('u-devtools:event', this.eventHandler);
  }

  /**
   * Override on() for HMR, as subscription is already set up in constructor
   */
  override on(event: string, fn: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(fn);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(fn);
      }
    };
  }

  protected sendMessage(type: string, data: unknown): void {
    if (type === 'request') {
      this.hot.send('u-devtools:request', data);
    }
  }

  protected subscribe(_type: string, _handler: (data: unknown) => void): () => void {
    // HMR is already subscribed in constructor, just return empty function
    // as handling happens through responseHandler and eventHandler
    return () => {
      // Unsubscription is handled in dispose
    };
  }

  protected unsubscribe(_type: string, _handler: (data: unknown) => void): void {
    // HMR doesn't support unsubscribing individual handlers directly
    // Unsubscription happens through dispose
  }

  override dispose() {
    super.dispose();

    // Unsubscribe from HMR events if API supports off
    if (this.hot.off && this.responseHandler) {
      this.hot.off('u-devtools:response', this.responseHandler);
    }
    if (this.hot.off && this.eventHandler) {
      this.hot.off('u-devtools:event', this.eventHandler);
    }
  }
}
