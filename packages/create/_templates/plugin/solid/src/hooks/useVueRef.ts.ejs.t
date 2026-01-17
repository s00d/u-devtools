---
to: <%= projectName %>/src/hooks/useVueRef.ts
---
import { createEffect } from 'solid-js';
import type { Accessor } from 'solid-js';

/**
 * Hook for binding complex props and events to Vue Web Components in SolidJS.
 * SolidJS handles attributes reactively, but for objects/arrays/functions we need to use .props.
 */
export function useVueRef<T extends HTMLElement = HTMLElement>(
  props: Accessor<Record<string, any>> | Record<string, any>
): (el: T | null) => void {
  return (el: T | null) => {
    if (!el) return;

    createEffect(() => {
      const propsValue = typeof props === 'function' ? props() : props;
      if (el) {
        // Use the .props setter we defined in the adapter
        (el as any).props = propsValue;
      }
    });
  };
}

