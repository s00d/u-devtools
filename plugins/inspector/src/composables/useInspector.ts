import { useBridge } from '../context';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue';

/**
 * Composable for inspector functionality (toggle, select, bridge)
 */
export function useInspector() {
  const bridge = useBridge();
  // Используем bridge.state() для синхронизации
  const isInspecting = useSyncedRef(bridge.state('isInspecting', false));

  const toggleInspect = () => {
    isInspecting.value = !isInspecting.value;
  };

  const selectNode = (
    type: 'parent' | 'sibling' | 'child',
    index?: number,
    currentElement?: { tagName: string; id: string; classes: string }
  ) => {
    bridge.send('select-node', { type, index, currentElement });
  };

  return {
    isInspecting,
    toggleInspect,
    selectNode,
    bridge,
  };
}
