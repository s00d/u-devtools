import type { AppBridge } from '@u-devtools/core';
import type { VueInspectorProtocol } from '../../types';

export function registerTimelineHandlers(
  bridge: AppBridge<VueInspectorProtocol>,
  checkConnection: () => boolean
) {
  
  // Timeline events are managed via hooks in devtools-kit
  // For now, return empty arrays - can be extended later when Timeline API is fully available

  bridge.on('inspector:getTimelineLayers', () => {
    (async () => {
      if (!checkConnection()) {
        bridge.send('inspector:timelineLayers', []);
        return;
      }
      // Timeline layers API may not be available directly
      // Return empty array for now
      bridge.send('inspector:timelineLayers', []);
    })();
  });

  bridge.on('inspector:getTimelineEvents', (payload: Parameters<VueInspectorProtocol['inspector:getTimelineEvents']>[0]) => {
    (async () => {
      if (!checkConnection()) {
        bridge.send('inspector:timelineEvents', []);
        return;
      }
      // Timeline events API may not be available directly
      // Return empty array for now
      bridge.send('inspector:timelineEvents', []);
    })();
  });
}

