/**
 * AppBridge provides a standardized way for plugins to communicate
 * between the application runtime (window) and the DevTools iframe.
 */
export declare class AppBridge<ToClientEvents = Record<string, any>, ToAppEvents = Record<string, any>> {
    namespace: string;
    private channel;
    private listeners;
    constructor(namespace: string);
    /**
     * Отправить событие "на ту сторону".
     */
    send(event: string, data?: any): void;
    /**
     * Слушать события "с той стороны".
     */
    on<T = any>(event: string, cb: (data: T) => void): () => void;
    close(): void;
}
//# sourceMappingURL=bridge-app.d.ts.map