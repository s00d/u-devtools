/**
 * App Context Entry Point
 * Декларативное определение плагина для контекста страницы
 */

import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { LibraryProtocol } from './types';
import LibraryInspector from './app/components/LibraryInspector.vue';

export default defineApp({
  // Компонент, который будет отрисован в оверлее
  component: LibraryInspector,

  // Логика инициализации
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<LibraryProtocol>;
    setupDevTools({ bridge: typedBridge });
    console.log('[Library Plugin] App loaded');
    
    // Очистка при удалении плагина
    onCleanup(() => {
      console.log('[Library Plugin] Cleanup');
    });
  },
});
