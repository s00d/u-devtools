export interface RpcMessage<T = unknown> {
    id: string;
    type: 'request' | 'response' | 'event';
    method?: string;
    payload?: T;
    error?: unknown;
}
export interface RpcClientInterface {
    call<T = unknown>(method: string, payload?: unknown): Promise<T>;
    on(event: string, callback: (data: unknown) => void): void;
    off?(event: string, callback: (data: unknown) => void): void;
}
export interface PluginCommand {
    id: string;
    label: string;
    icon?: string;
    action: () => void | Promise<void>;
    shortcut?: string[];
}
export interface StorageApi {
    get<T>(key: string, def: T): T;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
}
export interface ClientApi {
    rpc: RpcClientInterface;
    notify: (msg: string, type?: 'info' | 'error' | 'success') => void;
    storage: StorageApi;
}
export type UnmountFn = () => void;
export interface PluginSettingsSchema {
    [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'select';
        label: string;
        default?: unknown;
        options?: {
            label: string;
            value: unknown;
        }[];
    };
}
export interface PluginClientInstance {
    name: string;
    icon: string;
    settings?: PluginSettingsSchema;
    commands?: PluginCommand[];
    renderSidebar?: (el: HTMLElement, api: ClientApi) => UnmountFn;
    renderMain?: (el: HTMLElement, api: ClientApi) => UnmountFn;
}
export interface ServerContext {
    root: string;
    server: unknown;
}
export interface RpcServerInterface {
    handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;
    broadcast(event: string, payload?: unknown): void;
}
export interface DevToolsPlugin {
    name: string;
    clientPath?: string;
    appPath?: string;
    setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
}
export interface InspectorEvent {
    type: 'element-selected';
    data: {
        tagName: string;
        attrs: Record<string, string>;
        rect: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    };
}
export { safeResolve } from './utils/path';
export { AppBridge } from './bridge-app';
