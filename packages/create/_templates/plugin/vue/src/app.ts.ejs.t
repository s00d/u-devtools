---
to: <%= projectName %>/src/app.ts
---
import { defineApp, type AppContext } from '@u-devtools/kit';
import type { AppBridge, OverlayContext } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { <%= pluginName.replace(/\s+/g, '') %>Protocol } from './types';
<% if (features.includes('vue-component')) { -%>
import App from './app/App.vue';
<% } -%>

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export default defineApp({
  <% if (features.includes('vue-component')) { -%>
  // Vue компонент, который будет отрисован в оверлее
  component: App,
  <% } else { -%>
  component: undefined,
  <% } -%>

  <% if (features.includes('overlay')) { -%>
  // Декларативное меню
  menu: {
    id: '<%= pluginKebab %>:quick-action',
    label: 'Quick Action',
    icon: 'Bolt',
    order: 10,
    action: (ctx: OverlayContext) => {
      if (!ctx.isOpen) {
        ctx.open();
      }
      ctx.switchPlugin('<%= pluginName %>');
      // Bridge доступен через замыкание в setup
    },
  },
  <% } -%>

  // Логика инициализации
  setup({ bridge, onCleanup }: AppContext) {
    const typedBridge = bridge as AppBridge<<%= pluginName.replace(/\s+/g, '') %>Protocol>;
    
    // Инициализируем контекст (в app контексте api нет)
    setupDevTools({ bridge: typedBridge });
    
    console.log('<%= pluginName %> loaded in app context');

    // Example: Send data to Client
    typedBridge.send('<%= pluginKebab %>:ready', { message: 'App script loaded' });

    // Example: Listen for events from Client
    typedBridge.on('<%= pluginKebab %>:action', (data: unknown) => {
      console.log('Received action from Client:', data);
      // You can perform DOM operations, network interception, etc. here
    });

    <% if (features.includes('overlay')) { -%>
    // Store bridge for menu action
    (window as any).__<%= pluginName.replace(/\s+/g, '').toUpperCase() %>_BRIDGE__ = typedBridge;
    <% } -%>

    // Очистка при удалении плагина
    onCleanup(() => {
      console.log('<%= pluginName %> cleanup');
      // Здесь можно удалить слушатели событий, таймеры и т.д.
    });
  },
});
