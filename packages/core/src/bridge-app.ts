/**
 * AppBridge provides a standardized way for plugins to communicate
 * between the application runtime (window) and the DevTools iframe.
 */
export class AppBridge<ToClientEvents = Record<string, any>, ToAppEvents = Record<string, any>> {
  private channel: BroadcastChannel;
  private listeners = new Map<string, Set<Function>>();

  constructor(public namespace: string) {
    // Автоматическое пространство имен
    this.channel = new BroadcastChannel(`u-devtools:${namespace}`);

    this.channel.onmessage = (e) => {
      const { event, data } = e.data as { event: string; data: unknown };
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.forEach((fn) => fn(data));
      }
    };
  }

  /**
   * Отправить событие "на ту сторону".
   */
  send(event: string, data?: any): void {
    this.channel.postMessage({ event, data });
  }

  /**
   * Слушать события "с той стороны".
   */
  on<T = any>(event: string, cb: (data: T) => void): () => void {
    const eventStr = String(event);
    if (!this.listeners.has(eventStr)) {
      this.listeners.set(eventStr, new Set());
    }
    this.listeners.get(eventStr)!.add(cb);

    // Возвращаем функцию отписки
    return () => {
      this.listeners.get(eventStr)?.delete(cb);
    };
  }

  close() {
    this.channel.close();
    this.listeners.clear();
  }
}

