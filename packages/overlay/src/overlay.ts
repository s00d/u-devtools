import { createApp, type Component, h } from 'vue';
import { getOverlayLayer } from './overlay-utils';

/**
 * Mount a Vue component into the plugins overlay layer.
 * 
 * Styles are automatically available from the shared style context
 * in the overlay's Shadow DOM (Tailwind + UI Kit loaded once).
 * 
 * @param component Vue component to mount
 * @param props Props to pass to the component
 * @returns Unmount function to clean up
 */
export async function mountAppOverlay(
  component: Component,
  props: Record<string, any> = {}
): Promise<() => void> {
  const container = await getOverlayLayer('plugins');
  
  // Create container for this specific plugin
  const el = document.createElement('div');
  
  // IMPORTANT:
  // 1. position: absolute + inset: 0 inside fixed container stretches it to full screen.
  // 2. pointer-events: none allows clicks to pass through empty areas.
  // 3. overflow: hidden prevents scrollbars from appearing if elements overflow.
  el.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;
  
  container.appendChild(el);

  // Create Vue app with proper configuration
  // Disable devtools to prevent adding attributes to page elements
  const app = createApp({
    render: () => h(component, props)
  });

  // Mount inside the container (which is inside Shadow DOM)
  app.mount(el);

  // Return cleanup function
  return () => {
    app.unmount();
    el.remove();
  };
}

// Note: UOverlayBox, useElementRect, and ElementRect are exported from index.ts
