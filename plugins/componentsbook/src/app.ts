import { defineApp, type AppContext } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { ComponentsbookProtocol } from './types';
import Canvas from './app/Canvas.vue';

export default defineApp({
  // Component that will be rendered in overlay
  component: Canvas,

  // Setup logic
  setup({ bridge, onCleanup }: AppContext) {
    const typedBridge = bridge as AppBridge<ComponentsbookProtocol>;
    setupDevTools({ bridge: typedBridge });
    console.log('[componentsbook] Canvas initialized');

    // Cleanup
    onCleanup(() => {
      console.log('[componentsbook] Cleanup');
    });
  },
});
