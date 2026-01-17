/**
 * Typed Event Bus for inter-plugin communication
 */

/**
 * EventBus events interface.
 * Plugins can extend this interface through module augmentation.
 *
 * @example
 * ```typescript
 * // In your plugin
 * declare module '@u-devtools/core' {
 *   interface BusEvents {
 *     'my-plugin:custom-event': { data: string };
 *   }
 * }
 * ```
 */
export interface BusEvents {
  'plugin:mounted': { name: string };
  'plugin:unmounted': { name: string };
  navigate: { path: string };
  'settings:changed': { key: string; value: unknown };
  'storage:changed': { key: string; value: unknown };
  [key: string]: unknown;
}

/**
 * Typed Event Emitter for inter-plugin communication.
 * Provides type-safe event emission and subscription.
 * 
 * @template T - Type definition for events and their data
 * 
 * @example
 * ```typescript
 * import { TypedEventBus, type BusEvents } from '@u-devtools/core';
 * 
 * // Create event bus instance
 * const bus = new TypedEventBus<BusEvents>();
 * 
 * // Emit events
 * bus.emit('plugin:mounted', { name: 'my-plugin' });
 * bus.emit('navigate', { path: '/settings' });
 * bus.emit('settings:changed', { key: 'theme', value: 'dark' });
 * 
 * // Subscribe to events
 * const unsubscribe1 = bus.on('plugin:mounted', ({ name }) => {
 *   console.log(`Plugin ${name} was mounted`);
 * });
 * 
 * const unsubscribe2 = bus.on('navigate', ({ path }) => {
 *   console.log(`Navigating to: ${path}`);
 * });
 * 
 * // Unsubscribe
 * unsubscribe1();
 * unsubscribe2();
 * 
 * // Or use off method (handler must be the same function reference)
 * const handler = ({ name }: { name: string }) => {
 *   console.log(`Plugin ${name} was mounted`);
 * };
 * bus.on('plugin:mounted', handler);
 * bus.off('plugin:mounted', handler);
 * ```
 */
export class TypedEventBus<T extends Record<string, unknown> = BusEvents> {
  private listeners = new Map<keyof T, Set<(data: T[keyof T]) => void>>();

  /**
   * Emit an event
   */
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => {
        fn(data);
      });
    }
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.add(handler as (data: T[keyof T]) => void);
    }

    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as (data: T[keyof T]) => void);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get the number of subscribers for an event
   */
  listenerCount<K extends keyof T>(event: K): number {
    return this.listeners.get(event)?.size || 0;
  }
}
