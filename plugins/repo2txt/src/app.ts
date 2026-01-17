import { defineApp, type AppContext } from '@u-devtools/kit';
import type { AppBridge, OverlayContext } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { repo2txtProtocol } from './types';


export default defineApp({
  component: undefined,

  // Declarative menu
  menu: {
    id: 'repo2txt:quick-action',
    label: 'Quick Action',
    icon: 'Bolt',
    order: 10,
    action: (ctx: OverlayContext) => {
      if (!ctx.isOpen) {
        ctx.open();
      }
      ctx.switchPlugin('repo2txt');
      // Bridge is available via closure in setup
    },
  },

  // Initialization logic
  setup({ bridge, onCleanup }: AppContext) {
    const typedBridge = bridge as AppBridge<repo2txtProtocol>;

    // Initialize context (no api in app context)
    setupDevTools({ bridge: typedBridge });

    console.log('repo2txt loaded in app context');

    // Example: Send data to Client
    typedBridge.send('repo2txt:ready', { message: 'App script loaded' });

    // Example: Listen for events from Client
    typedBridge.on('repo2txt:action', (data: unknown) => {
      console.log('Received action from Client:', data);
      // You can perform DOM operations, network interception, etc. here
    });

    // Store bridge for menu action
    (window as any).__REPO2TXT_BRIDGE__ = typedBridge;

    // Cleanup when plugin is removed
    onCleanup(() => {
      console.log('repo2txt cleanup');
      // Here you can remove event listeners, timers, etc.
    });
  },
});
