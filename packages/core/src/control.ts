import type { AppBridge } from './bridge-app';

export interface OverlayContext {
  /**
   * Open the main DevTools window
   */
  open: () => void;

  /**
   * Close the main DevTools window
   */
  close: () => void;

  /**
   * Toggle window state
   */
  toggle: () => void;

  /**
   * Current state
   */
  isOpen: boolean;

  /**
   * Switch to plugin by name
   */
  switchPlugin: (pluginName: string) => void;

  /**
   * Switch tab within plugin by tab name
   */
  switchTab: (pluginName: string, tabName: string) => void;

  /**
   * Create a temporary bridge for sending messages.
   * Useful if you don't have access to the plugin's global bridge in this scope.
   */
  createBridge: (namespace: string) => AppBridge;
}

export interface OverlayMenuItem {
  id: string;
  label: string;
  icon?: string; // Icon name (Heroicons) - for backward compatibility
  iconSvg?: string; // SVG as text
  iconUrl?: string; // URL to icon
  order?: number;
  /**
   * Event handlers (receive context)
   */
  onClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onDoubleClick?: (ctx: OverlayContext, event: MouseEvent) => void;
  onContextMenu?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseEnter?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseLeave?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseDown?: (ctx: OverlayContext, event: MouseEvent) => void;
  onMouseUp?: (ctx: OverlayContext, event: MouseEvent) => void;
  onKeyDown?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onKeyUp?: (ctx: OverlayContext, event: KeyboardEvent) => void;
  onFocus?: (ctx: OverlayContext, event: FocusEvent) => void;
  onBlur?: (ctx: OverlayContext, event: FocusEvent) => void;
}

declare global {
  interface Window {
    __UDEVTOOLS_MENU_ITEMS__?: OverlayMenuItem[];
  }
}

export class DevToolsControl {
  private channel: BroadcastChannel;

  constructor() {
    // Single channel for state management
    this.channel = new BroadcastChannel('u-devtools:control');
  }

  /**
   * Open DevTools
   */
  open() {
    this.channel.postMessage({ action: 'open' });
  }

  /**
   * Close DevTools
   */
  close() {
    this.channel.postMessage({ action: 'close' });
  }

  /**
   * Toggle state
   */
  toggle() {
    this.channel.postMessage({ action: 'toggle' });
  }

  /**
   * Get current state (asynchronously)
   */
  isOpen(): Promise<boolean> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data?.type === 'u-devtools:state-response') {
          this.channel.removeEventListener('message', handler);
          resolve(e.data.isOpen);
        }
      };

      this.channel.addEventListener('message', handler);
      // Request state
      this.channel.postMessage({ action: 'get-state' });

      // Timeout in case DevTools is not loaded
      setTimeout(() => {
        this.channel.removeEventListener('message', handler);
        resolve(false);
      }, 200);
    });
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(cb: (isOpen: boolean) => void) {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'u-devtools:state-changed') {
        cb(e.data.isOpen);
      }
    };
    this.channel.addEventListener('message', handler);
    return () => this.channel.removeEventListener('message', handler);
  }

  /**
   * Switch to plugin by name
   */
  switchPlugin(pluginName: string) {
    this.channel.postMessage({ action: 'switch-plugin', pluginName });
  }

  /**
   * Switch tab within plugin by tab name
   */
  switchTab(pluginName: string, tabName: string) {
    this.channel.postMessage({ action: 'switch-tab', pluginName, tabName });
  }

  destroy() {
    this.channel.close();
  }
}

// Export singleton for convenience
export const devtools = new DevToolsControl();
