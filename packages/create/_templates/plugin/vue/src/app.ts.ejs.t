---
to: <%= projectName %>/src/app.ts
---
<% if (features.includes('app-bridge')) { -%>
import { AppBridge<% if (features.includes('overlay')) { %>, registerMenuItem<% } %> } from '@u-devtools/core';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

const bridge = new AppBridge('<%= pluginKebab %>');

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

// HMR cleanup (REQUIRED)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hot = (import.meta as any).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    bridge.close();
  });
}
<% } else { -%>
// App context script (empty - app-bridge feature not selected)
<% } -%>

