import { ref } from 'vue';
import { AppBridge } from '@u-devtools/core';

/**
 * Composable for inspector functionality (toggle, select, bridge)
 */
export function useInspector() {
  const bridge = new AppBridge('inspector');
  const isInspecting = ref(false);

  const toggleInspect = () => {
    isInspecting.value = !isInspecting.value;
    bridge.send('toggle-inspector', { state: isInspecting.value });
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
