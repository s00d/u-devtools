import type { EventBusApi, BusEvents } from '@u-devtools/core';
import { TypedEventBus } from '@u-devtools/core';

// Глобальная типизированная шина событий
const bus = new TypedEventBus<BusEvents>();

/**
 * Создает API для межплагинного взаимодействия.
 * Использует типизированный EventBus для type safety.
 */
export function createBusApi(): EventBusApi {
  return {
    emit: (event: string, data?: unknown) => {
      bus.emit(event as keyof BusEvents, data as BusEvents[keyof BusEvents]);
    },
    on: (event: string, handler: (data: unknown) => void) => {
      return bus.on(
        event as keyof BusEvents,
        handler as (data: BusEvents[keyof BusEvents]) => void
      );
    },
    off: (event: string, handler: (data: unknown) => void) => {
      bus.off(event as keyof BusEvents, handler as (data: BusEvents[keyof BusEvents]) => void);
    },
  };
}

/**
 * Получить типизированный доступ к EventBus (для внутреннего использования)
 */
export function getTypedBus(): TypedEventBus<BusEvents> {
  return bus;
}
