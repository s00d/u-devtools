/**
 * Utilities for working with the overlay host in app context
 */

export const OVERLAY_ID = {
  HOST: 'u-devtools-overlay-host',
  /** Container for plugins (inspectors, grids, highlights) */
  PLUGINS: 'u-devtools-plugins-layer',
  /** Container for UI (launcher button, iframe) */
  SHELL: 'u-devtools-shell-layer',
  /** Container for notifications */
  TOAST: 'u-devtools-toast-layer'
} as const;

export const OVERLAY_READY_EVENT = 'u-devtools:overlay-ready';

export type OverlayLayer = 'plugins' | 'shell' | 'toast';

declare global {
  interface Window {
    __UDEVTOOLS_OVERLAY_READY__?: boolean;
  }
}

/**
 * Get the overlay host element.
 * Returns null if not found.
 */
export function getOverlayHost(): HTMLElement | null {
  return document.getElementById(OVERLAY_ID.HOST);
}

/**
 * Ожидает готовности оверлея через событие.
 * Гарантирует выполнение, даже если оверлей уже загружен.
 */
export function onOverlayReady(): Promise<void> {
  // 1. Быстрая проверка: если уже готово, резолвим сразу
  if (window.__UDEVTOOLS_OVERLAY_READY__) {
    return Promise.resolve();
  }

  // 2. Если нет, ждем события
  return new Promise((resolve) => {
    const handler = () => {
      window.removeEventListener(OVERLAY_READY_EVENT, handler);
      resolve();
    };
    window.addEventListener(OVERLAY_READY_EVENT, handler);
  });
}

/**
 * Получить ShadowRoot (асинхронно, но реактивно через события)
 */
export async function getOverlayShadowRoot(): Promise<ShadowRoot> {
  await onOverlayReady();
  const host = getOverlayHost();
  if (!host || !host.shadowRoot) {
    throw new Error('[u-devtools] Overlay host missing despite ready event');
  }
  return host.shadowRoot;
}

/**
 * Get a specific overlay layer container.
 * @param layer Layer name (default: 'plugins')
 * @returns Promise that resolves with the layer container element
 */
export async function getOverlayLayer(layer: OverlayLayer = 'plugins'): Promise<HTMLElement> {
  const shadow = await getOverlayShadowRoot();
  const id = layer === 'plugins' ? OVERLAY_ID.PLUGINS 
           : layer === 'shell' ? OVERLAY_ID.SHELL 
           : OVERLAY_ID.TOAST;
           
  const el = shadow.getElementById(id);
  if (!el) {
    throw new Error(`[u-devtools] Layer #${id} not found`);
  }
  return el as HTMLElement;
}
