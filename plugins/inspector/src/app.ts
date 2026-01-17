import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { InspectorProtocol } from './types';
import InspectorOverlay from './app/components/InspectorOverlay.vue';

export default defineApp({
  component: InspectorOverlay,

  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<InspectorProtocol>;
    setupDevTools({ bridge: typedBridge });
    
    console.log('[Inspector Plugin] App loaded');
    
    onCleanup(() => {
      console.log('[Inspector Plugin] Cleanup');
    });
  },
});
