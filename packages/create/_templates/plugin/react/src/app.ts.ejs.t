---
to: <%= projectName %>/src/app.ts
---
import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { <%= pluginName.replace(/\s+/g, '') %>Protocol } from './types';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export default defineApp({
  component: undefined,

  <% if (features.includes('overlay')) { -%>
  // Declarative menu
  menu: {
    id: '<%= pluginKebab %>:quick-action',
    label: 'Quick Action',
    icon: 'Bolt',
    order: 10,
    action: (ctx) => {
      if (!ctx.isOpen) {
        ctx.open();
      }
      ctx.switchPlugin('<%= pluginName %>');
      // Bridge is available via closure in setup
    },
  },
  <% } -%>

  // Initialization logic
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<<%= pluginName.replace(/\s+/g, '') %>Protocol>;
    
    // Initialize context (in app context api is not available)
    setupDevTools({ bridge: typedBridge });
    
    console.log('<%= pluginName %> loaded in app context');

    // Example: Send data to Client
    typedBridge.send('<%= pluginKebab %>:ready', { message: 'App script loaded' });

    // Example: Listen for events from Client
    typedBridge.on('<%= pluginKebab %>:action', (data) => {
      console.log('Received action from Client:', data);
      // You can perform DOM operations, network interception, etc. here
    });

    <% if (features.includes('overlay')) { -%>
    // Store bridge for menu action
    (window as any).__<%= pluginName.replace(/\s+/g, '').toUpperCase() %>_BRIDGE__ = typedBridge;
    <% } -%>

    // Cleanup when plugin is removed
    onCleanup(() => {
      console.log('<%= pluginName %> cleanup');
      // Here you can remove event listeners, timers, etc.
    });
  },
});
