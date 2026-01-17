import { getOverlayLayer } from './overlay-utils';

/**
 * Show a toast notification in the overlay toast layer
 */
async function showToastInOverlay(message: string, type: 'info' | 'error' | 'success' = 'info') {
  const toastLayer = await getOverlayLayer('toast');
  
  // Create toast element
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-family: ui-sans-serif, system-ui, sans-serif;
    z-index: 10000;
    pointer-events: auto;
    max-width: 400px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  if (!document.head.querySelector('#u-devtools-toast-styles')) {
    style.id = 'u-devtools-toast-styles';
    document.head.appendChild(style);
  }
  
  toast.textContent = message;
  toastLayer.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

export interface Toast {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

/**
 * Creates a toast instance that works in both iframe (Client) and Overlay (App) contexts
 * 
 * @returns Toast object with success, error, and info methods
 */
export function createToast(): Toast {
  const showToast = async (message: string, type: 'info' | 'error' | 'success' = 'info') => {
    // Check if we're in iframe (Client) or in Overlay (App)
    const isInIframe = window.self !== window.top;
    
    if (isInIframe) {
      // In iframe - send postMessage to parent (Overlay)
      window.parent.postMessage({
        type: 'u-devtools:toast',
        message,
        toastType: type,
      }, '*');
    } else {
      // In Overlay - show directly
      await showToastInOverlay(message, type);
    }
  };

  return {
    success: (msg: string) => showToast(msg, 'success'),
    error: (msg: string) => showToast(msg, 'error'),
    info: (msg: string) => showToast(msg, 'info'),
  };
}
