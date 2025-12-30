import type { AppBridge } from './bridge-app';

export interface OverlayContext {
  /**
   * Открыть основное окно DevTools
   */
  open: () => void;
  
  /**
   * Закрыть основное окно DevTools
   */
  close: () => void;
  
  /**
   * Переключить состояние окна
   */
  toggle: () => void;
  
  /**
   * Текущее состояние
   */
  isOpen: boolean;

  /**
   * Переключить на плагин по имени
   */
  switchPlugin: (pluginName: string) => void;

  /**
   * Переключить таб внутри плагина по имени таба
   */
  switchTab: (pluginName: string, tabName: string) => void;

  /**
   * Создать временный мост для отправки сообщения.
   * Полезно, если у вас нет доступа к глобальному мосту плагина в данной области видимости.
   */
  createBridge: (namespace: string) => AppBridge;
}

export interface OverlayMenuItem {
  id: string;
  label: string;
  icon?: string; // Имя иконки (Heroicons) - для обратной совместимости
  iconSvg?: string; // SVG как текст
  iconUrl?: string; // URL к иконке
  order?: number;
  /**
   * Обработчики событий (принимают контекст)
   */
  onClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onDoubleClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onContextMenu?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseEnter?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseLeave?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseDown?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseUp?: (ctx: OverlayContext, event: MouseEvent) => void;
  onKeyDown?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onKeyUp?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onFocus?: (ctx: OverlayContext, event: FocusEvent) => void;
  onBlur?: (ctx: OverlayContext, event: FocusEvent) => void;
}

export const OVERLAY_EVENT = 'u-devtools:register-menu-item';

declare global {
  interface Window {
    __UDEVTOOLS_MENU_ITEMS__?: OverlayMenuItem[];
  }
}

/**
 * Функция для регистрации кнопки в оверлее (вызывается из app.ts плагина)
 */
export function registerMenuItem(item: OverlayMenuItem) {
  if (typeof window === 'undefined') return;
  
  // Инициализируем глобальный массив, если его нет
  if (!window.__UDEVTOOLS_MENU_ITEMS__) {
    window.__UDEVTOOLS_MENU_ITEMS__ = [];
  }
  
  // Сохраняем элемент в глобальный массив (для случаев, когда overlay еще не загружен)
  const existingIdx = window.__UDEVTOOLS_MENU_ITEMS__.findIndex(i => i.id === item.id);
  if (existingIdx !== -1) {
    window.__UDEVTOOLS_MENU_ITEMS__[existingIdx] = item;
  } else {
    window.__UDEVTOOLS_MENU_ITEMS__.push(item);
  }
  
  // Отправляем событие, которое поймает Vue-приложение оверлея (для обратной совместимости)
  window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, {
    detail: item
  }));
}

export class DevToolsControl {
  private channel: BroadcastChannel;

  constructor() {
    // Единый канал для управления состоянием
    this.channel = new BroadcastChannel('u-devtools:control');
  }

  /**
   * Открыть DevTools
   */
  open() {
    this.channel.postMessage({ action: 'open' });
  }

  /**
   * Закрыть DevTools
   */
  close() {
    this.channel.postMessage({ action: 'close' });
  }

  /**
   * Переключить состояние
   */
  toggle() {
    this.channel.postMessage({ action: 'toggle' });
  }

  /**
   * Получить текущее состояние (асинхронно)
   */
  isOpen(): Promise<boolean> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === 'u-devtools:state-response') {
          this.channel.removeEventListener('message', handler);
          resolve(e.data.isOpen);
        }
      };
      
      this.channel.addEventListener('message', handler);
      // Запрашиваем состояние
      this.channel.postMessage({ action: 'get-state' });
      
      // Таймаут на случай, если девтулс не загружен
      setTimeout(() => {
        this.channel.removeEventListener('message', handler);
        resolve(false);
      }, 200);
    });
  }
  
  /**
   * Подписаться на изменение состояния
   */
  onStateChange(cb: (isOpen: boolean) => void) {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'u-devtools:state-changed') {
        cb(e.data.isOpen);
      }
    };
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  /**
   * Переключить на плагин по имени
   */
  switchPlugin(pluginName: string) {
    this.channel.postMessage({ action: 'switch-plugin', pluginName });
  }

  /**
   * Переключить таб внутри плагина по имени таба
   */
  switchTab(pluginName: string, tabName: string) {
    this.channel.postMessage({ action: 'switch-tab', pluginName, tabName });
  }

  destroy() {
    this.channel.close();
  }
}

// Экспортируем синглтон для удобства
export const devtools = new DevToolsControl();

