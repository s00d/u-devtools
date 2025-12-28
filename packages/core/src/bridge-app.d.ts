/**
 * AppBridge provides a standardized way for plugins to communicate
 * between the application runtime (window) and the DevTools iframe.
 */
export declare class AppBridge<T = unknown> {
    private channel;
    constructor(name: string);
    send(event: string, data: T): void;
    on<D = T>(event: string, cb: (data: D) => void): () => void;
    close(): void;
}
