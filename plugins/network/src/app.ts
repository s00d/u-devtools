import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('network');

// Patch fetch
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url =
    typeof resource === 'string'
      ? resource
      : resource instanceof Request
        ? resource.url
        : String(resource);
  const method = config?.method || 'GET';
  const startTime = Date.now();
  const id = Math.random().toString(36).slice(2);

  bridge.send('request-start', { id, url, method, startTime });

  try {
    const response = await originalFetch(...args);

    bridge.send('request-end', {
      id,
      status: response.status,
      statusText: response.statusText,
      endTime: Date.now(),
      duration: Date.now() - startTime,
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network Error';
    bridge.send('request-error', {
      id,
      error: errorMessage,
      endTime: Date.now(),
      duration: Date.now() - startTime,
    });
    throw error;
  }
};

// Patch XMLHttpRequest
const XHR = window.XMLHttpRequest;
const originalOpen = XHR.prototype.open;
const originalSend = XHR.prototype.send;
const originalSetRequestHeader = XHR.prototype.setRequestHeader;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Extending native class
window.XMLHttpRequest = class extends XHR {
  private _id = Math.random().toString(36).slice(2);
  private _method = 'GET';
  private _url = '';
  private _startTime = 0;

  open(method: string, url: string | URL, ...args: unknown[]) {
    this._method = method;
    this._url = typeof url === 'string' ? url : url.toString();
    return originalOpen.apply(this, [method, url, ...args] as never);
  }

  setRequestHeader(header: string, value: string) {
    return originalSetRequestHeader.apply(this, [header, value] as never);
  }

  send(body?: Document | XMLHttpRequestBodyInit | null) {
    this._startTime = Date.now();

    // Notify about request start
    bridge.send('request-start', {
      id: this._id,
      url: this._url,
      method: this._method,
      startTime: this._startTime,
    });

    this.addEventListener('loadend', () => {
      // Notify about request end
      bridge.send('request-end', {
        id: this._id,
        status: this.status,
        statusText: this.statusText,
        endTime: Date.now(),
        duration: Date.now() - this._startTime,
      });
    });

    this.addEventListener('error', () => {
      bridge.send('request-error', {
        id: this._id,
        error: 'Network Error',
        endTime: Date.now(),
        duration: Date.now() - this._startTime,
      });
    });

    return originalSend.apply(this, [body] as never);
  }
};
