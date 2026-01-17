---
to: <%= projectName %>/src/app.ts
---
import { defineApp } from '@u-devtools/kit';
<% if (features.includes('overlay')) { -%>
import { registerMenuItem } from '@u-devtools/core';
<% } -%>

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export default defineApp({
  component: undefined,

  // Initialization logic
  setup({ bridge, onCleanup }) {
    console.log('<%= pluginName %> loaded in app context');

    // Example: Send data to Client
    bridge.send('<%= pluginKebab %>:ready', { message: 'App script loaded' });

    // Example: Listen for events from Client
    bridge.on('<%= pluginKebab %>:action', (data: unknown) => {
      console.log('Received action from Client:', data);
      // You can perform DOM operations, network interception, etc. here
    });

    <% if (features.includes('overlay')) { -%>
    // Example: Register overlay menu item
    registerMenuItem({
      id: '<%= pluginKebab %>:quick-action',
      label: 'Quick Action',
      icon: 'Bolt',
      order: 10,
      onClick: (ctx) => {
        if (!ctx.isOpen) {
          ctx.open();
        }
        ctx.switchPlugin('<%= pluginName %>');
        bridge.send('<%= pluginKebab %>:quick-action', { timestamp: Date.now() });
      },
    });
    <% } -%>

    // Cleanup when plugin is removed
    onCleanup(() => {
      console.log('<%= pluginName %> cleanup');
      // Here you can remove event listeners, timers, etc.
    });
  },
});
