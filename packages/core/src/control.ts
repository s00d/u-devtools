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
   * Создать временный мост для отправки сообщения.
   * Полезно, если у вас нет доступа к глобальному мосту плагина в данной области видимости.
   */
  createBridge: (namespace: string) => AppBridge;
}

export interface OverlayMenuItem {
  id: string;
  label: string;
  icon: string; // Имя иконки (Heroicons)
  order?: number;
  /**
   * Теперь принимает контекст
   */
  onClick: (ctx: OverlayContext) => void;
}

export const OVERLAY_EVENT = 'u-devtools:register-menu-item';

/**
 * Функция для регистрации кнопки в оверлее (вызывается из app.ts плагина)
 */
export function registerMenuItem(item: OverlayMenuItem) {
  if (typeof window === 'undefined') return;
  
  // Отправляем событие, которое поймает Vue-приложение оверлея
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

  destroy() {
    this.channel.close();
  }
}

// Экспортируем синглтон для удобства
export const devtools = new DevToolsControl();

