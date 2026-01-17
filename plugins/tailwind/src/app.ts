/**
 * Browser Runtime Entry Point
 * Декларативное определение плагина для контекста страницы
 */

import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { TailwindProtocol } from './types';
import App from './app/App.vue';

export default defineApp({
  // Компонент, который будет отрисован в оверлее
  component: App,

  menu: {
    id: 'tailwind',
    label: 'Tailwind',
    icon: 'Squares2X2',
    action: 'toggle-ui',
  },

  // Логика инициализации
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<TailwindProtocol>;
    setupDevTools({ bridge: typedBridge });
    console.log('[Tailwind DevTools] App loaded');
    
    // Очистка при удалении плагина
    onCleanup(() => {
      console.log('[Tailwind DevTools] Cleanup');
    });
  },
});
