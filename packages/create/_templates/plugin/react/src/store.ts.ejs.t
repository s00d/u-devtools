---
to: <%= projectName %>/src/store.ts
---
import { useBridge } from './context';
import type { <%= pluginName.replace(/\s+/g, '') %>Protocol } from './types';

// Get bridge from context (must be called inside React component or after setupDevTools)
// Example: Create synced state
export function useStore() {
  const bridge = useBridge();
  return {
    isOpen: bridge.state('isOpen', false),
  };
}

