---
to: <%= projectName %>/src/actions/useVueProps.ts
---
import type { Action } from 'svelte/action';

/**
 * Svelte action for binding complex props and events to Vue Web Components.
 * Svelte handles attributes reactively, but for objects/arrays/functions we need to use .props.
 */
export const useVueProps: Action<HTMLElement, Record<string, any>> = (node, props) => {
  if (!props) return;

  // Set initial props
  (node as any).props = props;

  // Update props when they change
  return {
    update(newProps) {
      if (newProps) {
        (node as any).props = newProps;
      }
    },
  };
};

