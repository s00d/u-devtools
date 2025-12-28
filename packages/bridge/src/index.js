// Генератор ID
const uuid = () => Math.random().toString(36).substring(2, 15);
/**
 * КЛИЕНТСКАЯ ЧАСТЬ (Браузер)
 * Работает через import.meta.hot
 */
export class ViteRpcClient {
    constructor(hot) {
        this.hot = hot;
        this.handlers = new Map();
        this.eventListeners = new Map();
        if (!hot)
            throw new Error('Hot Module Replacement is required for DevTools');
        // Слушаем ответы от сервера
        hot.on('u-devtools:response', (data) => {
            const msg = data;
            const handler = this.handlers.get(msg.id);
            if (handler) {
                if (msg.error) {
                    handler.reject(new Error(String(msg.error)));
                }
                else {
                    handler.resolve(msg.payload);
                }
                this.handlers.delete(msg.id);
            }
        });
        // Слушаем события от сервера (push notifications)
        hot.on('u-devtools:event', (data) => {
            const msg = data;
            const listeners = this.eventListeners.get(msg.method || '');
            if (listeners) {
                for (const fn of listeners) {
                    fn(msg.payload);
                }
            }
        });
    }
    // Вызов метода на сервере
    call(method, payload) {
        const id = uuid();
        return new Promise((resolve, reject) => {
            this.handlers.set(id, {
                resolve: resolve,
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
    // Подписка на события
    on(event, fn) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)?.add(fn);
    }
    // Отписка от событий
    off(event, fn) {
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
    constructor(ws) {
        this.ws = ws;
        this.methods = new Map();
        // Слушаем запросы от клиента
        ws.on('u-devtools:request', async (data, client) => {
            const msg = data;
            const { id, method, payload } = msg;
            try {
                const fn = this.methods.get(method || '');
                if (!fn)
                    throw new Error(`Method ${method} not found`);
                const result = await fn(payload);
                // Отправляем ответ конкретному клиенту
                client.send('u-devtools:response', {
                    id,
                    type: 'response',
                    payload: result,
                });
            }
            catch (e) {
                const error = e instanceof Error ? e.message : String(e);
                client.send('u-devtools:response', {
                    id,
                    type: 'response',
                    error,
                });
            }
        });
    }
    handle(method, fn) {
        this.methods.set(method, fn);
    }
    broadcast(event, payload) {
        this.ws.send('u-devtools:event', {
            type: 'event',
            method: event,
            payload,
        });
    }
}
