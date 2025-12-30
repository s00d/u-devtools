/**
 * КЛИЕНТСКАЯ ЧАСТЬ (Браузер)
 * Работает через import.meta.hot
 */
export declare class ViteRpcClient {
  private hot;
  private handlers;
  private eventListeners;
  constructor(hot: {
    send: (event: string, data: unknown) => void;
    on: (event: string, handler: (data: unknown) => void) => void;
  });
  call<T = unknown>(method: string, payload?: unknown): Promise<T>;
  on(event: string, fn: (data: unknown) => void): () => void;
  off(event: string, fn: (data: unknown) => void): void;
}
/**
 * СЕРВЕРНАЯ ЧАСТЬ (Node.js)
 * Работает через server.ws
 */
export declare class ViteRpcServer {
  private ws;
  private methods;
  constructor(ws: {
    on: (
      event: string,
      handler: (
        data: unknown,
        client: {
          send: (event: string, data: unknown) => void;
        }
      ) => void
    ) => void;
    send: (event: string, data: unknown) => void;
  });
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;
  broadcast(event: string, payload?: unknown): void;
  getMethodsCount(): number;
  getMethods(): string[];
}
//# sourceMappingURL=index.d.ts.map
