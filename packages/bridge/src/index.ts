import type { RpcMessage } from '@u-devtools/core';

// Генератор ID
const uuid = () => Math.random().toString(36).substring(2, 15);

/**
 * КЛИЕНТСКАЯ ЧАСТЬ (Браузер)
 * Работает через import.meta.hot
 */
export class ViteRpcClient {
  private handlers = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();
  private eventListeners = new Map<string, Set<(data: unknown) => void>>();

  constructor(
    private hot: {
      send: (event: string, data: unknown) => void;
      on: (event: string, handler: (data: unknown) => void) => void;
    }
  ) {
    if (!hot) throw new Error('Hot Module Replacement is required for DevTools');

    // Слушаем ответы от сервера
    hot.on('u-devtools:response', (data: unknown) => {
      const msg = data as RpcMessage;
      const handler = this.handlers.get(msg.id);
      if (handler) {
        if (msg.error) {
          handler.reject(new Error(String(msg.error)));
        } else {
          handler.resolve(msg.payload);
        }
        this.handlers.delete(msg.id);
      }
    });

    // Слушаем события от сервера (push notifications)
    hot.on('u-devtools:event', (data: unknown) => {
      const msg = data as RpcMessage;
      const listeners = this.eventListeners.get(msg.method || '');
      if (listeners) {
        for (const fn of listeners) {
          fn(msg.payload);
        }
      }
    });
  }

  // Вызов метода на сервере
  call<T = unknown>(method: string, payload?: unknown): Promise<T> {
    const id = uuid();
    return new Promise<T>((resolve, reject) => {
      this.handlers.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      // Отправляем запрос через нативный канал Vite
      this.hot.send('u-devtools:request', { id, method, payload });

      // Таймаут на всякий случай
      setTimeout(() => {
        if (this.handlers.has(id)) {
          this.handlers.delete(id);
          reject(new Error(`RPC Timeout: ${method}`));
        }
      }, 5000);
    });
  }

  // Подписка на события (возвращает функцию для отписки)
  on(event: string, fn: (data: unknown) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(fn);
    
    // Возвращаем функцию для отписки
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(fn);
      }
    };
  }

  // Отписка от событий
  off(event: string, fn: (data: unknown) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(fn);
    }
  }
}

/**
 * СЕРВЕРНАЯ ЧАСТЬ (Node.js)
 * Работает через server.ws
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
    // Слушаем запросы от клиента
    ws.on(
      'u-devtools:request',
      async (data: unknown, client: { send: (event: string, data: unknown) => void }) => {
        const msg = data as RpcMessage;
        const { id, method, payload } = msg;

        try {
          const fn = this.methods.get(method || '');
          if (!fn) throw new Error(`Method ${method} not found`);

          const result = await fn(payload);

          // Отправляем ответ конкретному клиенту
          client.send('u-devtools:response', {
            id,
            type: 'response',
            payload: result,
          });
        } catch (e) {
          const error = e instanceof Error ? e.message : String(e);
          client.send('u-devtools:response', {
            id,
            type: 'response',
            error,
          });
        }
      }
    );
  }

  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown) {
    this.methods.set(method, fn);
  }

  broadcast(event: string, payload?: unknown) {
    this.ws.send('u-devtools:event', {
      type: 'event',
      method: event,
      payload,
    });
  }
}
