/**
 * AppBridge provides a standardized way for plugins to communicate
 * between the application runtime (window) and the DevTools iframe.
 */
export class AppBridge<T = unknown> {
  private channel: BroadcastChannel;

  constructor(name: string) {
    this.channel = new BroadcastChannel(`u-devtools-${name}`);
  }

  send(event: string, data: T) {
    this.channel.postMessage({ type: event, data });
  }

  on<D = T>(event: string, cb: (data: D) => void): () => void {
    const handler = (e: MessageEvent) => {
      if (e.data.type === event) {
        cb(e.data.data as D);
      }
    };
    this.channel.addEventListener('message', handler);
    return () => {
      this.channel.removeEventListener('message', handler);
    };
  }

  close() {
    this.channel.close();
  }
}

