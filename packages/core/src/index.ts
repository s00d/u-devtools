// Forward reference for AppBridge (exported at the end of file)
import type { AppBridge } from './bridge-app';

// --- RPC Interfaces ---

/**
 * RPC message structure for communication between Server and Client contexts.
 * Used for typed RPC over WebSocket (Server ↔ Client).
 *
 * @template T - Type of the payload data
 */
export interface RpcMessage<T = unknown> {
  /** Unique message identifier */
  id: string;
  /** Message type: 'request' for RPC calls, 'response' for replies, 'event' for broadcasts */
  type: 'request' | 'response' | 'event';
  /** RPC method name (for requests) */
  method?: string;
  /** Message payload data */
  payload?: T;
  /** Error information (for error responses) */
  error?: unknown;
}

/**
 * RPC Client Interface for making remote procedure calls.
 * Provides methods to call server methods and subscribe to events.
 *
 * Communication: Server ↔ Client via WebSocket (Vite HMR or custom WebSocket)
 */
export interface RpcClientInterface {
  /**
   * Call a remote method on the server.
   * @param method - Method name (e.g., 'sys:getPlugins')
   * @param payload - Optional payload data
   * @returns Promise that resolves with the method result
   * @template T - Return type of the method
   */
  call<T = unknown>(method: string, payload?: unknown): Promise<T>;

  /**
   * Subscribe to events from the server.
   * @param event - Event name
   * @param callback - Callback function to handle events
   * @returns Function to unsubscribe from the event
   */
  on(event: string, callback: (data: unknown) => void): () => void;

  /**
   * Unsubscribe from events (optional, some transports may not support it).
   * @param event - Event name
   * @param callback - Callback function to remove
   */
  off?(event: string, callback: (data: unknown) => void): void;
}

/**
 * Command definition for Command Palette (accessible via Cmd+K / Ctrl+K).
 * Commands allow users to quickly access plugin functionality.
 */
export interface PluginCommand {
  /** Unique command identifier (e.g., 'my-plugin:clear') */
  id: string;
  /** Display label in command palette */
  label: string;
  /** Heroicons icon name (optional) */
  icon?: string;
  /** Action to execute when command is triggered */
  action: () => void | Promise<void>;
  /** Keyboard shortcut keys (e.g., ['Meta', 'K', 'C']) */
  shortcut?: string[];
}

/**
 * Storage API for plugin-specific persistent storage.
 * Used for internal plugin state (e.g., last opened file, view preferences).
 * Storage is isolated per plugin and persists across sessions.
 *
 * @example
 * ```typescript
 * import type { StorageApi } from '@u-devtools/core';
 *
 * function useStorage(api: StorageApi) {
 *   // Store values
 *   api.set('lastView', 'list');
 *   api.set('filters', { category: 'all', sort: 'name' });
 *   api.set('items', ['item1', 'item2', 'item3']);
 *
 *   // Retrieve values with defaults
 *   const lastView = api.get('lastView', 'default');
 *   const filters = api.get('filters', { category: 'all' });
 *   const items = api.get<string[]>('items', []);
 *
 *   // Remove values
 *   api.remove('lastView');
 * }
 * ```
 */
export interface StorageApi {
  /**
   * Get a stored value.
   * @param key - Storage key
   * @param def - Default value if key doesn't exist
   * @returns Stored value or default
   * @template T - Type of the stored value
   */
  get<T>(key: string, def: T): T;

  /**
   * Set a stored value.
   * @param key - Storage key
   * @param value - Value to store
   * @template T - Type of the value
   */
  set<T>(key: string, value: T): void;

  /**
   * Remove a stored value.
   * @param key - Storage key to remove
   */
  remove(key: string): void;
}

/**
 * Settings API for user-configurable plugin settings.
 * Settings are displayed in DevTools settings panel and persist across sessions.
 *
 * @example
 * ```typescript
 * import type { SettingsApi } from '@u-devtools/core';
 *
 * function useSettings(api: SettingsApi) {
 *   // Get setting with default
 *   const fontSize = api.get('fontSize', 14);
 *   const theme = api.get('theme', 'dark');
 *   const enabled = api.get('enabled', true);
 *
 *   // Set settings
 *   api.set('fontSize', 16);
 *   api.set('theme', 'light');
 *   api.set('enabled', false);
 *
 *   // Access all settings reactively (for Vue bindings)
 *   const allSettings = api.all;
 * }
 * ```
 */
export interface SettingsApi {
  /**
   * Get a setting value.
   * @param key Setting key (without plugin prefix)
   * @param defaultValue Default value if setting is not set
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Set a setting value.
   * @param key Setting key
   * @param value New value
   */
  set(key: string, value: unknown): void;

  /**
   * Reactive object of all settings (for UI bindings)
   */
  all: Record<string, unknown>;
}

export interface ShortcutApi {
  /**
   * Register a keyboard shortcut.
   * @param keys Array of keys (e.g., ['Meta', 'K'])
   * @param action Action to execute on key press
   * @returns Function to unregister the shortcut
   */
  register(keys: string[], action: () => void): () => void;
}

export interface ClipboardApi {
  /**
   * Copy text to clipboard.
   * @param text Text to copy
   * @param successMessage Success message (optional)
   */
  copy(text: string, successMessage?: string): Promise<void>;

  /**
   * Read text from clipboard.
   * @returns Text from clipboard or empty string on error
   */
  read(): Promise<string>;
}

export interface EventBusApi {
  /**
   * Emit an event.
   * @param event Event name
   * @param data Event data
   */
  emit(event: string, data?: unknown): void;

  /**
   * Subscribe to an event.
   * @param event Event name
   * @param handler Event handler
   * @returns Function to unsubscribe
   */
  on(event: string, handler: (data: unknown) => void): () => void;

  /**
   * Unsubscribe from an event.
   * @param event Event name
   * @param handler Event handler
   */
  off(event: string, handler: (data: unknown) => void): void;
}

export interface DialogApi {
  /**
   * Show a confirmation dialog.
   * @param options Dialog options
   * @returns Promise with result (true if confirmed)
   */
  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean>;

  /**
   * Show an input dialog.
   * @param options Dialog options
   * @returns Promise with entered text or null if cancelled
   */
  prompt(options: {
    title: string;
    message: string;
    defaultValue?: string;
  }): Promise<string | null>;
}

export interface NavigationApi {
  /**
   * Switch active plugin
   */
  openPlugin(pluginName: string): void;
}

/**
 * Client API - Main API object provided to plugins in Client context.
 * Provides access to all DevTools services: RPC, storage, settings, notifications, etc.
 *
 * Available in: Client context (Vue 3 iframe)
 *
 * @example
 * ```typescript
 * import type { PluginClientInstance } from '@u-devtools/core';
 *
 * const plugin: PluginClientInstance = {
 *   name: 'My Plugin',
 *   icon: 'Cube',
 *
 *   renderMain(container, api) {
 *     // Use api.storage for plugin state
 *     api.storage.set('lastView', 'list');
 *     const lastView = api.storage.get('lastView', 'default');
 *
 *     // Use api.settings for user preferences
 *     api.settings.set('fontSize', 16);
 *     const fontSize = api.settings.get('fontSize', 14);
 *
 *     // Navigation
 *     api.navigation.openPlugin('other-plugin');
 *
 *     // Event bus
 *     api.bus.on('other-plugin:event', (data) => {
 *       console.log('Received event:', data);
 *     });
 *     api.bus.emit('my-plugin:event', { data: 'value' });
 *
 *     // Async operations (use async IIFE for await)
 *     (async () => {
 *       // Use api.rpc to call server methods
 *       const data = await api.rpc.call('my-plugin:getData');
 *
 *       // Notifications
 *       api.notify('Data saved successfully', 'success');
 *
 *       // Clipboard
 *       await api.clipboard.copy('text to copy');
 *
 *       // Dialog
 *       const confirmed = await api.dialog.confirm({
 *         title: 'Confirm',
 *         message: 'Are you sure?',
 *       });
 *     })();
 *
 *     return () => {}; // Cleanup function
 *   }
 * };
 * ```
 */
export interface ClientApi {
  /** RPC client for calling server methods */
  rpc: RpcClientInterface;
  /** Show a notification to the user */
  notify: (msg: string, type?: 'info' | 'error' | 'success') => void;
  /** Storage API for plugin-specific persistent state (e.g., last opened file) */
  storage: StorageApi;
  /** Settings API for user-configurable preferences (e.g., font size, theme) */
  settings: SettingsApi;
  /** Keyboard shortcuts API */
  shortcuts: ShortcutApi;
  /** Clipboard operations API */
  clipboard: ClipboardApi;
  /** Event bus for plugin-to-plugin communication */
  bus: EventBusApi;
  /** Dialog API for confirmations and prompts */
  dialog: DialogApi;
  /** Navigation API for switching between plugins */
  navigation: NavigationApi;
}

// --- Plugin Interfaces ---
export type UnmountFn = () => void;

/**
 * Setting type for plugin settings schema.
 * Defines the input type for user-configurable settings.
 */
export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'array';

/**
 * Setting schema definition for a single setting.
 * Used to define user-configurable settings that appear in the DevTools settings panel.
 *
 * @example
 * ```typescript
 * const pluginWithSettings: PluginClientInstance = {
 *   name: 'My Plugin',
 *   icon: 'Cube',
 *
 *   settings: {
 *     fontSize: {
 *       label: 'Font Size',
 *       description: 'Base font size for the plugin',
 *       type: 'number',
 *       default: 14,
 *     },
 *     theme: {
 *       label: 'Theme',
 *       type: 'select',
 *       default: 'dark',
 *       options: [
 *         { label: 'Dark', value: 'dark' },
 *         { label: 'Light', value: 'light' },
 *       ],
 *     },
 *   },
 *
 *   renderMain(container, api) {
 *     // Access settings
 *     const fontSize = api.settings.get('fontSize', 14);
 *     const theme = api.settings.get('theme', 'dark');
 *
 *     return () => {};
 *   }
 * };
 * ```
 */
export interface SettingSchemaDef {
  /** Display label for the setting */
  label: string;
  /** Optional description/tooltip text */
  description?: string;
  /** Setting type (determines input component) */
  type: SettingType;
  /** Default value */
  default?: unknown;
  /** Options for 'select' type settings */
  options?: { label: string; value: unknown }[];
  /** Schema for array items (for 'array' type with object items) */
  items?: Record<string, SettingSchemaDef>;
  /** Item type for 'array' type with primitive items ('string' or 'number') */
  itemType?: 'string' | 'number';
}

/**
 * Plugin settings schema - defines all user-configurable settings for a plugin.
 *
 * Settings are automatically displayed in the DevTools settings panel and
 * can be accessed via `api.settings.get()` and `api.settings.set()`.
 *
 * @example
 * ```ts
 * const plugin: PluginClientInstance = {
 *   name: 'My Plugin',
 *   icon: 'Cube',
 *   settings: {
 *     apiUrl: {
 *       label: 'API URL',
 *       type: 'string',
 *       default: 'https://api.example.com'
 *     },
 *     timeout: {
 *       label: 'Timeout (ms)',
 *       type: 'number',
 *       default: 5000
 *     }
 *   }
 * };
 * ```
 */
export interface PluginSettingsSchema {
  [key: string]: SettingSchemaDef;
}

/**
 * Menu item for the "General" section in ActivityBar.
 *
 * Allows plugins to add their actions to the general menu, even if the plugin
 * itself is hidden from the main ActivityBar menu.
 *
 * @example
 * ```ts
 * const plugin: PluginClientInstance = {
 *   name: 'Plugins',
 *   icon: 'Squares2X2',
 *   hideFromMenu: true,
 *   generalMenuItems: [
 *     {
 *       label: 'Extensions',
 *       icon: 'Squares2X2',
 *       action: (api) => {
 *         api.navigation.openPlugin('Plugins');
 *       }
 *     }
 *   ]
 * };
 * ```
 */
export interface GeneralMenuItem {
  /** Menu item label text */
  label: string;
  /** Heroicons icon name (e.g., 'Cube', 'MagnifyingGlass') */
  icon: string;
  /**
   * Action callback when menu item is clicked.
   * @param api - Client API for interacting with DevTools
   */
  action: (api: ClientApi) => void;
}

/**
 * Plugin Client Instance - Definition of a plugin's UI and behavior in Client context.
 * This is the main export from a plugin's client.ts file.
 *
 * @example
 * ```ts
 * import type { PluginClientInstance } from '@u-devtools/core';
 *
 * const plugin: PluginClientInstance = {
 *   name: 'My Plugin',
 *   icon: 'Cube',
 *   settings: { },
 *   commands: [ ],
 *   renderMain(container, api) {
 *     // Render your plugin UI
 *     return () => { };
 *   }
 * };
 *
 * export default plugin;
 * ```
 */
export interface PluginClientInstance {
  /** Display name shown in DevTools UI */
  name: string;
  /** Heroicons icon name (e.g., 'Cube', 'MagnifyingGlass', 'WrenchScrewdriver') */
  icon: string;

  /**
   * Hide plugin from main ActivityBar menu.
   * Plugin will still be accessible via navigation API or generalMenuItems.
   */
  hideFromMenu?: boolean;

  /** Settings schema for user-configurable options */
  settings?: PluginSettingsSchema;

  /** Commands accessible via Command Palette (Cmd+K / Ctrl+K) */
  commands?: PluginCommand[];

  /**
   * Menu items for the "General" section in ActivityBar.
   * Allows plugins to add their actions to the general menu.
   */
  generalMenuItems?: GeneralMenuItem[];

  /**
   * Render sidebar panel (optional).
   * @param el - Container element to render into
   * @param api - Client API for plugin functionality
   * @param options - Additional options including AppBridge
   * @returns Cleanup function called when plugin is unmounted
   */
  renderSidebar?: (el: HTMLElement, api: ClientApi, options: { bridge: AppBridge<any> }) => UnmountFn;

  /**
   * Render main panel (optional).
   * This is the primary UI for your plugin.
   * @param el - Container element to render into
   * @param api - Client API for plugin functionality
   * @param options - Additional options including AppBridge
   * @returns Cleanup function called when plugin is unmounted
   */
  renderMain?: (el: HTMLElement, api: ClientApi, options: { bridge: AppBridge<any> }) => UnmountFn;

  /**
   * Render custom settings UI (optional).
   * If not provided, settings will use the default form based on settings schema.
   * @param el - Container element to render into
   * @param api - Client API for plugin functionality
   * @param options - Additional options including AppBridge
   * @returns Cleanup function called when plugin is unmounted
   */
  renderSettings?: (el: HTMLElement, api: ClientApi, options: { bridge: AppBridge<any> }) => UnmountFn;
}

/**
 * Server Context - Context object provided to server-side plugin setup.
 * Available in: Server context (Node.js - Vite dev server)
 */
export interface ServerContext {
  /** Project root directory path */
  root: string;
  /** Vite dev server instance (for advanced use cases) */
  server: unknown;
}

/**
 * RPC Server Interface - Interface for handling RPC requests from clients.
 * Used in server-side plugin setup to register method handlers.
 *
 * @example
 * ```ts
 * export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
 *   rpc.handle('my-plugin:getData', async (payload) => {
 *     // Handle RPC call
 *     return { data: 'result' };
 *   });
 *
 *   rpc.broadcast('my-plugin:update', { data: 'new' });
 * }
 * ```
 */
export interface RpcServerInterface {
  /**
   * Register a handler for an RPC method.
   * @param method - Method name (e.g., 'my-plugin:getData')
   * @param fn - Handler function that receives payload and returns result
   */
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;

  /**
   * Broadcast an event to all connected clients.
   * @param event - Event name
   * @param payload - Optional event data
   */
  broadcast(event: string, payload?: unknown): void;
}

export interface PluginMetadata {
  name: string; // npm package name
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string; // Repository URL (GitHub, GitLab, etc.)
}

/**
 * DevTools Plugin Definition - Server-side plugin configuration.
 * Defines a plugin's structure and entry points for all three execution contexts.
 *
 * Created using definePlugin() helper from @u-devtools/kit/define-plugin.
 *
 * @example
 * ```ts
 * import { definePlugin } from '@u-devtools/kit/define-plugin';
 *
 * export default definePlugin({
 *   name: 'My Plugin',
 *   root: import.meta.url,
 *   client: './client',
 *   app: './app',
 *   server: './server',
 * });
 * ```
 */
export interface DevToolsPlugin {
  /** Display name of the plugin */
  name: string;
  /** Absolute path to client.ts file (Client context) */
  clientPath?: string;
  /** Absolute path to app.ts file (App context - main window) */
  appPath?: string;
  /**
   * Server-side setup function (Server context - Node.js).
   * Called when plugin is loaded to register RPC handlers.
   * @param rpc - RPC server interface for handling requests
   * @param ctx - Server context with root path and Vite server instance
   */
  setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
  /** Plugin metadata (name, version, description, etc.) */
  meta?: PluginMetadata;
  /**
   * Optional Vite plugins to be merged with the main DevTools plugin.
   * These plugins will be added to the Vite configuration.
   */
  vitePlugins?: (() => import('vite').PluginOption | import('vite').PluginOption[])[];
}

export interface InspectorEvent {
  type: 'element-selected';
  data: {
    tagName: string;
    attrs: Record<string, string>;
    rect: { x: number; y: number; width: number; height: number };
  };
}

export { AppBridge, SyncedState } from './bridge-app';
export * from './control';
export { Transport } from './transport';
export { HmrTransport } from './transports/hmr-transport';
export * from './schemas/settings';
export * from './schemas/rpc';
export { BroadcastTransport } from './transports/broadcast-transport';
export { WebSocketTransport } from './transports/websocket-transport';
export { TypedEventBus, type BusEvents } from './event-bus';

