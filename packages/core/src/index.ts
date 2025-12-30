// --- RPC Interfaces ---
export interface RpcMessage<T = unknown> {
  id: string;
  type: 'request' | 'response' | 'event';
  method?: string;
  payload?: T;
  error?: unknown;
}

export interface RpcClientInterface {
  call<T = unknown>(method: string, payload?: unknown): Promise<T>;
  on(event: string, callback: (data: unknown) => void): () => void;
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

export interface SettingsApi {
  /**
   * Получить значение настройки.
   * @param key Ключ настройки (без префикса плагина)
   * @param defaultValue Значение по умолчанию, если настройка не задана
   */
  get<T>(key: string, defaultValue?: T): T;

  /**
   * Установить значение настройки.
   * @param key Ключ настройки
   * @param value Новое значение
   */
  set(key: string, value: unknown): void;

  /**
   * Реактивный объект всех настроек (для UI биндингов)
   */
  all: Record<string, unknown>;
}

export interface ShortcutApi {
  /**
   * Зарегистрировать горячую клавишу.
   * @param keys Массив клавиш (например, ['Meta', 'K'])
   * @param action Действие при нажатии
   * @returns Функция для отмены регистрации
   */
  register(keys: string[], action: () => void): () => void;
}

export interface ClipboardApi {
  /**
   * Скопировать текст в буфер обмена.
   * @param text Текст для копирования
   * @param successMessage Сообщение об успехе (опционально)
   */
  copy(text: string, successMessage?: string): Promise<void>;

  /**
   * Прочитать текст из буфера обмена.
   * @returns Текст из буфера или пустая строка при ошибке
   */
  read(): Promise<string>;
}

export interface EventBusApi {
  /**
   * Отправить событие.
   * @param event Имя события
   * @param data Данные события
   */
  emit(event: string, data?: unknown): void;

  /**
   * Подписаться на событие.
   * @param event Имя события
   * @param handler Обработчик события
   * @returns Функция для отписки
   */
  on(event: string, handler: (data: unknown) => void): () => void;

  /**
   * Отписаться от события.
   * @param event Имя события
   * @param handler Обработчик события
   */
  off(event: string, handler: (data: unknown) => void): void;
}

export interface DialogApi {
  /**
   * Показать диалог подтверждения.
   * @param options Опции диалога
   * @returns Promise с результатом (true если подтверждено)
   */
  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean>;

  /**
   * Показать диалог ввода.
   * @param options Опции диалога
   * @returns Promise с введенным текстом или null если отменено
   */
  prompt(options: {
    title: string;
    message: string;
    defaultValue?: string;
  }): Promise<string | null>;
}

export interface ClientApi {
  rpc: RpcClientInterface;
  notify: (msg: string, type?: 'info' | 'error' | 'success') => void;
  storage: StorageApi; // Для внутреннего состояния (last opened file)
  settings: SettingsApi; // Для пользовательских настроек (font size, theme)
  shortcuts: ShortcutApi;
  clipboard: ClipboardApi;
  bus: EventBusApi;
  dialog: DialogApi;
}

// --- Plugin Interfaces ---
export type UnmountFn = () => void;

export type SettingType = 'string' | 'number' | 'boolean' | 'select' | 'array';

export interface SettingSchemaDef {
  label: string;
  description?: string;
  type: SettingType;
  default?: unknown;
  // Для select
  options?: { label: string; value: unknown }[];
  // Для array: описывает структуру элемента массива
  items?: Record<string, SettingSchemaDef>;
  // Или если массив примитивов (строк)
  itemType?: 'string' | 'number';
}

export interface PluginSettingsSchema {
  [key: string]: SettingSchemaDef;
}

export interface PluginClientInstance {
  name: string;
  icon: string;

  settings?: PluginSettingsSchema;
  commands?: PluginCommand[];

  renderSidebar?: (el: HTMLElement, api: ClientApi) => UnmountFn;
  renderMain?: (el: HTMLElement, api: ClientApi) => UnmountFn;
  renderSettings?: (el: HTMLElement, api: ClientApi) => UnmountFn;
}

export interface ServerContext {
  root: string;
  server: unknown;
}

export interface RpcServerInterface {
  handle(method: string, fn: (payload: unknown) => Promise<unknown> | unknown): void;
  broadcast(event: string, payload?: unknown): void;
}

export interface PluginMetadata {
  name: string; // npm package name
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repo?: string;
}

export interface DevToolsPlugin {
  name: string;
  clientPath?: string;
  appPath?: string;
  setupServer?: (rpc: RpcServerInterface, ctx: ServerContext) => void;
  meta?: PluginMetadata;
  /**
   * Optional Vite plugins to be added to the Vite config
   * These plugins will be merged with the main DevTools plugin
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

export { AppBridge } from './bridge-app';
export * from './control';
