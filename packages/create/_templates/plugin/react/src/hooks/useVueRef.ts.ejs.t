---
to: <%= projectName %>/src/hooks/useVueRef.ts
---
import { useRef, useLayoutEffect } from 'react';

/**
 * Hook for binding complex props and events to Vue Web Components.
 * React 18 passes attributes as strings, so for objects/arrays/functions this hook is needed.
 */
export function useVueRef<T = HTMLElement>(props: Record<string, any>) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      // Use the .props setter we defined in the adapter
      (ref.current as any).props = props;
    }
  });

  return ref;
}

