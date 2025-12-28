import type { EventBusApi } from '@u-devtools/core';

// Простая реализация Event Bus без внешних зависимостей
class SimpleEventBus {
  private listeners = new Map<string, Set<Function>>();

  emit(event: string, data?: unknown) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => fn(data));
    }
  }

  on(event: string, handler: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Возвращаем функцию отписки
    return () => {
      this.off(event, handler);
    };
  }

  off(event: string, handler: (data: unknown) => void) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }
}

// Глобальная шина событий
const bus = new SimpleEventBus();

/**
 * Создает API для межплагинного взаимодействия.
 */
export function createBusApi(): EventBusApi {
  return {
    emit: (event: string, data?: unknown) => bus.emit(event, data),
    on: (event: string, handler: (data: unknown) => void) => bus.on(event, handler),
    off: (event: string, handler: (data: unknown) => void) => bus.off(event, handler),
  };
}

