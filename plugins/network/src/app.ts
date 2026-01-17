import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { setupDevTools } from './context';
import type { MockRule, NetworkProtocol, ProtocolType, WebSocketFrame } from './types';

// Storage for active mocking rules
let activeRules: MockRule[] = [];

// --- Helpers ---
function generateId() {
  return Math.random().toString(36).slice(2);
}

function parseHeaders(headers: Headers | string): Record<string, string> {
  const res: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((v, k) => {
      res[k] = v;
    });
  } else if (typeof headers === 'string') {
    headers.split(/[\r\n]+/).forEach((line) => {
      const parts = line.split(': ');
      const key = parts.shift();
      if (key) res[key] = parts.join(': ');
    });
  }
  return res;
}

// Helper for safe body reading
async function readBody(response: Response) {
  try {
    const clone = response.clone();
    const text = await clone.text();
    try {
      return JSON.parse(text); // If JSON, return object
    } catch {
      return text; // Otherwise string
    }
  } catch {
    return '[Stream or Binary data]';
  }
}

// Helper for finding mocking rule
function findMockRule(url: string, method: string): MockRule | undefined {
  return activeRules.find((rule) => {
    // Check method
    if (rule.method !== '*' && rule.method.toUpperCase() !== method.toUpperCase()) {
      return false;
    }
    // Check URL (simplified: includes or RegExp)
    try {
      if (url.includes(rule.urlMatcher)) return true;
      const regex = new RegExp(rule.urlMatcher);
      return regex.test(url);
    } catch {
      return url.includes(rule.urlMatcher);
    }
  });
}

// === FILTERING LOGIC ===
// Критически важно: фильтруем запросы самого DevTools, чтобы избежать рекурсивного спама
const IGNORED_PREFIXES = [
  '/__u-devtools',       // RPC Bridge & Assets
  '/@vite/client',       // Vite HMR Client
  '/@fs/',               // Vite File System access
  '/@id/',               // Vite Module IDs
  'node_modules/.vite',  // Vite Pre-bundled deps
  '.hot-update.json',    // HMR Updates
  'u-devtools-ws',       // DevTools WebSocket
];

/**
 * Determines if a URL should be ignored to prevent recursive spam
 * from DevTools internal requests
 */
function shouldIgnoreUrl(url: string | URL): boolean {
  const urlStr = url.toString();
  
  // 1. Ignore internal DevTools / Vite paths
  if (IGNORED_PREFIXES.some(prefix => urlStr.includes(prefix))) {
    return true;
  }
  
  // 2. Ignore data: URIs (too large/noisy)
  if (urlStr.startsWith('data:')) {
    return true;
  }

  // 3. Ignore chrome-extension:// schemes
  if (urlStr.startsWith('chrome-extension://')) {
    return true;
  }

  // 4. Ignore Vite HMR WebSocket connections
  if (urlStr.includes('vite-hmr') || urlStr.includes('localhost:24678')) {
    return true;
  }

  return false;
}

// === LIBRARY DETECTOR ===
/**
 * Analyzes call stack to detect which library initiated the request
 * Works for Axios, Apollo, TanStack Query, SWR, Ky, SuperAgent, etc.
 */
function detectClientLibrary(): string | undefined {
  try {
    const stack = new Error().stack || '';
    
    // Порядок важен: от высокоуровневых к низкоуровневым
    // GraphQL clients
    if (stack.includes('node_modules/@apollo') || stack.includes('apollo-client')) return 'Apollo';
    if (stack.includes('node_modules/@urql') || stack.includes('urql')) return 'Urql';
    if (stack.includes('node_modules/graphql-request')) return 'GraphQL Request';
    
    // React Query / TanStack Query
    if (stack.includes('node_modules/@tanstack') || stack.includes('@tanstack/react-query')) return 'TanStack Query';
    
    // Data fetching libraries
    if (stack.includes('node_modules/swr')) return 'SWR';
    if (stack.includes('node_modules/react-query')) return 'React Query';
    
    // HTTP clients
    if (stack.includes('node_modules/axios') || stack.includes('/axios/')) return 'Axios';
    if (stack.includes('node_modules/ky') || stack.includes('/ky/')) return 'Ky';
    if (stack.includes('node_modules/superagent') || stack.includes('/superagent/')) return 'SuperAgent';
    if (stack.includes('node_modules/got')) return 'Got';
    if (stack.includes('node_modules/node-fetch')) return 'Node Fetch';
    
    // WebSocket libraries
    if (stack.includes('node_modules/socket.io') || stack.includes('socket.io-client')) return 'Socket.IO';
    if (stack.includes('node_modules/ws') && !stack.includes('node_modules/@u-devtools')) return 'WebSocket (ws)';
    
    // Polyfills
    if (stack.includes('node_modules/whatwg-fetch')) return 'Fetch Polyfill';
    
    // Angular (uses XHR internally)
    if (stack.includes('@angular/common/http')) return 'Angular HttpClient';
    
    // Vue (if using vue-axios or similar)
    if (stack.includes('vue-axios')) return 'Vue Axios';
    
    // jQuery (legacy)
    if (stack.includes('jquery') && stack.includes('ajax')) return 'jQuery AJAX';
    
  } catch {
    return undefined;
  }
  return undefined;
}

// --- Protocol Detection Helpers ---
/**
 * Detects high-level protocol from request data
 * Supports: GraphQL, gRPC-Web, JSON-RPC
 */
function detectProtocol(url: string, headers: Record<string, string>, body: any): { type: ProtocolType; operation?: string } {
  // 1. gRPC-Web (check Content-Type first)
  const contentType = headers['content-type'] || headers['Content-Type'] || '';
  if (contentType.includes('application/grpc-web') || contentType.includes('application/grpc')) {
    // Extract operation name from URL path (usually last segment)
    const operation = url.split('/').filter(Boolean).pop() || 'Unknown';
    return { type: 'grpc', operation };
  }

  // 2. GraphQL (check body structure)
  if (body && typeof body === 'object') {
    // GraphQL requests have 'query' and optionally 'variables'
    if ('query' in body) {
      let opName = body.operationName;
      
      // Try to extract from query string if operationName not provided
      if (!opName && typeof body.query === 'string') {
        // Match: query GetUsers { ... } or mutation CreateUser { ... }
        const match = body.query.match(/(query|mutation|subscription)\s+(\w+)/);
        if (match) {
          opName = match[2];
        } else {
          // Fallback: try to find first word after query/mutation
          const fallbackMatch = body.query.match(/\{\s*(\w+)/);
          if (fallbackMatch) opName = fallbackMatch[1];
        }
      }
      
      return { 
        type: 'graphql', 
        operation: opName || 'Anonymous Operation' 
      };
    }
    
    // 3. JSON-RPC (check for jsonrpc field)
    if ('jsonrpc' in body && 'method' in body) {
      return { 
        type: 'json-rpc', 
        operation: typeof body.method === 'string' ? body.method : 'Unknown Method'
      };
    }
  }

  // Default: standard HTTP
  return { type: 'http' };
}

// --- PATCH FETCH ---
const originalFetch = window.fetch;

const createFetchPatcher = (bridge: AppBridge<NetworkProtocol>) => {
  return async (...args: Parameters<typeof fetch>) => {
  const [resource, config] = args;
  const url =
    typeof resource === 'string'
      ? resource
      : resource instanceof Request
        ? resource.url
        : String(resource);
  const method = config?.method || (resource instanceof Request ? resource.method : 'GET');
  const startTime = Date.now();
  const id = generateId();

  const requestHeaders = config?.headers ? parseHeaders(new Headers(config.headers)) : {};
  // Try to save request body (if string)
  let requestBody: unknown = config?.body;
  if (typeof requestBody === 'string') {
    try {
      requestBody = JSON.parse(requestBody);
    } catch {
      // Keep as string
    }
  }

  // DETECT PROTOCOL (GQL / RPC / gRPC)
  const { type: subType, operation } = detectProtocol(url, requestHeaders, requestBody);
  
  // DETECT CLIENT LIBRARY (Axios, Apollo, etc.)
  const clientLibrary = detectClientLibrary();
  
  // Если это GraphQL или RPC, используем имя операции вместо метода
  let displayMethod = method.toUpperCase();
  if (operation) {
    const prefix = subType === 'graphql' ? 'GQL' : subType === 'json-rpc' ? 'RPC' : subType === 'grpc' ? 'gRPC' : '';
    displayMethod = prefix ? `${prefix}: ${operation}` : method.toUpperCase();
  }

  // 1. CHECK MOCKS
  const rule = findMockRule(url, method);

  if (rule) {
    // Log start (as usual, to see in panel)
    bridge.send('request-start', {
      id,
      url,
      method: displayMethod,
      type: 'fetch',
      subType,
      clientLibrary,
      startTime,
      requestHeaders,
      requestBody,
      isMock: true, // Flag for UI
    });

    // Simulate delay
    if (rule.responseDelay > 0) {
      await new Promise((r) => setTimeout(r, rule.responseDelay));
    }

    // Form response
    const responseInit: ResponseInit = {
      status: rule.responseStatus,
      statusText: rule.responseStatus === 200 ? 'OK' : 'Mocked',
      headers: new Headers(rule.responseHeaders || { 'Content-Type': 'application/json' }),
    };

    const response = new Response(rule.responseBody, responseInit);

    // Log end
    bridge.send('request-end', {
      id,
      status: rule.responseStatus,
      statusText: `(Mocked) ${rule.responseStatus}`,
      endTime: Date.now(),
      duration: Date.now() - startTime,
    });

    // Send response details to see them in panel
    bridge.send('request-details', {
      id,
      responseBody:
        rule.responseType === 'json' ? JSON.parse(rule.responseBody || '{}') : rule.responseBody,
      responseHeaders: rule.responseHeaders,
    });

    return response;
  }

  bridge.send('request-start', {
    id,
    url,
    method: displayMethod,
    type: 'fetch',
    subType,
    clientLibrary,
    startTime,
    requestHeaders,
    requestBody,
    isMock: false, // Default
  });

  try {
    const response = await originalFetch(...args);

    // Smart Body Reading based on Content-Type
    const contentType = response.headers.get('content-type') || '';
    
    let bodyPromise: Promise<any>;
    if (contentType.includes('application/grpc-web') || contentType.includes('application/grpc')) {
      // gRPC binary - don't read as text to avoid corruption, just mark
      bodyPromise = Promise.resolve('[gRPC-Web Binary Stream]');
    } else if (contentType.includes('application/json')) {
      bodyPromise = response.clone().json().catch(() => response.clone().text());
    } else if (contentType.includes('text/') || contentType.includes('xml')) {
      bodyPromise = response.clone().text();
    } else {
      bodyPromise = Promise.resolve('[Binary/Stream Data]');
    }

    // Read response asynchronously, without blocking return
    bodyPromise.then((body) => {
      bridge.send('request-details', {
        id,
        responseBody: body,
        responseHeaders: parseHeaders(response.headers),
      });
    });

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
};

// --- PATCH XHR ---
const XHR = window.XMLHttpRequest;
const originalOpen = XHR.prototype.open;
const originalSetHeader = XHR.prototype.setRequestHeader;

// Extend XHR interface to store our data
interface PatchedXHR extends XMLHttpRequest {
  _udt_id?: string;
  _udt_method?: string;
  _udt_url?: string;
  _udt_start?: number;
  _udt_requestHeaders?: Record<string, string>;
  _udt_requestBody?: unknown;
  _udt_ignored?: boolean; // Flag to ignore this request (prevents recursive spam)
}

XHR.prototype.open = function (method: string, url: string | URL, ...args: unknown[]) {
  const xhr = this as PatchedXHR;
  xhr._udt_id = generateId();
  xhr._udt_method = method;
  xhr._udt_url = url.toString();
  xhr._udt_requestHeaders = {};

  // @ts-expect-error
  return originalOpen.apply(this, [method, url, ...args]);
};

XHR.prototype.setRequestHeader = function (header: string, value: string) {
  const xhr = this as PatchedXHR;
  if (!xhr._udt_ignored && xhr._udt_requestHeaders) {
    xhr._udt_requestHeaders[header] = value;
  }
  return originalSetHeader.apply(this, [header, value]);
};

const createXHRPatcher = (bridge: AppBridge<NetworkProtocol>) => {
  const originalSend = XHR.prototype.send;
  
  XHR.prototype.send = function (body?: unknown) {
    const xhr = this as PatchedXHR;
    
    // FILTER CHECK - если запрос игнорируется, просто пропускаем
    if (xhr._udt_ignored) {
      // @ts-expect-error
      return originalSend.apply(this, [body]);
    }
    
    xhr._udt_start = Date.now();

    // Save body
    if (typeof body === 'string') {
      try {
        xhr._udt_requestBody = JSON.parse(body);
      } catch {
        xhr._udt_requestBody = body;
      }
    } else {
      xhr._udt_requestBody = body; // FormData or Blob hard to serialize
    }

    // DETECT PROTOCOL (GQL / RPC / gRPC)
    const requestHeaders = xhr._udt_requestHeaders || {};
    const { type: subType, operation } = xhr._udt_url 
      ? detectProtocol(xhr._udt_url, requestHeaders, xhr._udt_requestBody)
      : { type: 'http' as ProtocolType, operation: undefined };
    
    // DETECT CLIENT LIBRARY (Axios, etc.)
    const clientLibrary = detectClientLibrary();
    
    let displayMethod = (xhr._udt_method || 'GET').toUpperCase();
    if (operation) {
      displayMethod = `${subType === 'graphql' ? 'GQL' : subType === 'json-rpc' ? 'RPC' : 'gRPC'}: ${operation}`;
    }

    // 1. CHECK MOCKS
    const rule = xhr._udt_url ? findMockRule(xhr._udt_url, xhr._udt_method || 'GET') : undefined;

    if (rule && xhr._udt_id) {
      // Log start
      bridge.send('request-start', {
      id: xhr._udt_id,
      url: xhr._udt_url!,
      method: displayMethod,
      type: 'xhr',
      subType,
      startTime: xhr._udt_start!,
      requestHeaders: xhr._udt_requestHeaders || {},
      requestBody: xhr._udt_requestBody,
      isMock: true,
    });

    // Emulate XHR lifecycle
    setTimeout(() => {
      // Prepare XHR properties (they're read-only, so use defineProperty)
      Object.defineProperty(xhr, 'status', {
        value: rule.responseStatus,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(xhr, 'statusText', {
        value: 'Mocked',
        writable: true,
        configurable: true,
      });
      Object.defineProperty(xhr, 'readyState', {
        value: 4,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(xhr, 'responseText', {
        value: rule.responseBody,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(xhr, 'response', {
        value: rule.responseBody,
        writable: true,
        configurable: true,
      });

      // Emulate headers
      const headersStr = Object.entries(rule.responseHeaders || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n');

      xhr.getAllResponseHeaders = () => headersStr;
      xhr.getResponseHeader = (name) => rule.responseHeaders?.[name] || null;

      // Trigger events
      xhr.dispatchEvent(new Event('readystatechange'));
      xhr.dispatchEvent(new ProgressEvent('load'));
      xhr.dispatchEvent(new ProgressEvent('loadend'));

      // Log end
      bridge.send('request-end', {
        id: xhr._udt_id!,
        status: rule.responseStatus,
        statusText: '(Mocked)',
        endTime: Date.now(),
        duration: Date.now() - (xhr._udt_start || 0),
      });

      bridge.send('request-details', {
        id: xhr._udt_id!,
        responseBody:
          rule.responseType === 'json' ? JSON.parse(rule.responseBody || '{}') : rule.responseBody,
        responseHeaders: rule.responseHeaders,
      });
    }, rule.responseDelay);

    return; // DON'T call originalSend
  }

  // 1. Start (for real requests)
  if (xhr._udt_id && xhr._udt_url) {
    // DETECT PROTOCOL (GQL / RPC / gRPC)
    const requestHeaders = xhr._udt_requestHeaders || {};
    const { type: subType, operation } = detectProtocol(xhr._udt_url, requestHeaders, xhr._udt_requestBody);
    
    // DETECT CLIENT LIBRARY (Axios, etc.)
    const clientLibrary = detectClientLibrary();
    
    let displayMethod = (xhr._udt_method || 'GET').toUpperCase();
    if (operation) {
      displayMethod = `${subType === 'graphql' ? 'GQL' : subType === 'json-rpc' ? 'RPC' : 'gRPC'}: ${operation}`;
    }

    bridge.send('request-start', {
      id: xhr._udt_id,
      url: xhr._udt_url,
      method: displayMethod,
      type: 'xhr',
      subType,
      clientLibrary,
      startTime: xhr._udt_start || Date.now(),
      requestHeaders: xhr._udt_requestHeaders || {},
      requestBody: xhr._udt_requestBody,
      isMock: false,
    });
  }

  // Listen for completion
  xhr.addEventListener('loadend', () => {
    if (!xhr._udt_id) return;

    let responseBody: unknown = xhr.response;
    try {
      if (xhr.responseType === '' || xhr.responseType === 'text') {
        try {
          responseBody = JSON.parse(xhr.responseText);
        } catch {
          responseBody = xhr.responseText;
        }
      }
    } catch {
      // Keep as is
    }

    bridge.send('request-details', {
      id: xhr._udt_id,
      responseBody: responseBody,
      responseHeaders: parseHeaders(xhr.getAllResponseHeaders()),
    });

    bridge.send('request-end', {
      id: xhr._udt_id,
      status: xhr.status,
      statusText: xhr.statusText,
      endTime: Date.now(),
      duration: Date.now() - (xhr._udt_start || 0),
    });
  });

  // Listen for error (network)
  xhr.addEventListener('error', () => {
    if (!xhr._udt_id) return;

    bridge.send('request-error', {
      id: xhr._udt_id,
      error: 'XHR Network Error',
      endTime: Date.now(),
      duration: Date.now() - (xhr._udt_start || 0),
    });
  });

    // @ts-expect-error
    return originalSend.apply(this, [body]);
  };
  
  return originalSend;
};

// --- PATCH BEACON API ---
const originalBeacon = navigator.sendBeacon;
const createBeaconPatcher = (bridge: AppBridge<NetworkProtocol>) => {
  return (url: string | URL, data?: BodyInit | null) => {
    // FILTER CHECK
    if (shouldIgnoreUrl(url)) {
      return originalBeacon.call(navigator, url, data);
    }
    
    const id = generateId();
    const startTime = Date.now();
    const urlStr = url.toString();

    // Try to parse body for protocol detection
    let requestBody: unknown = data;
    if (typeof data === 'string') {
      try {
        requestBody = JSON.parse(data);
      } catch {
        // Keep as string
      }
    }

    // DETECT PROTOCOL
    const { type: subType, operation } = detectProtocol(urlStr, {}, requestBody);
    
    // DETECT CLIENT LIBRARY
    const clientLibrary = detectClientLibrary();
    
    let displayMethod = 'POST';
    if (operation) {
      displayMethod = `${subType === 'graphql' ? 'GQL' : subType === 'json-rpc' ? 'RPC' : 'gRPC'}: ${operation}`;
    }

    bridge.send('request-start', {
      id,
      url: urlStr,
      method: displayMethod,
      type: 'beacon',
      subType,
      clientLibrary,
      startTime,
      requestHeaders: {},
      requestBody: requestBody,
    });

    const result = originalBeacon.call(navigator, url, data);

    // Beacon is fire-and-forget, assumes success if true returned
    if (result) {
      bridge.send('request-end', {
        id,
        status: 200,
        statusText: 'Queued',
        endTime: Date.now(),
        duration: 0,
      });
    } else {
      bridge.send('request-error', {
        id,
        error: 'Beacon failed to queue',
        endTime: Date.now(),
        duration: 0,
      });
    }

    return result;
  };
};

// --- PATCH WEBSOCKET ---
const OriginalWebSocket = window.WebSocket;
const createWebSocketPatcher = (bridge: AppBridge<NetworkProtocol>) => {
  return class PatchedWebSocket extends OriginalWebSocket {
    _udt_id: string;
    _udt_ignored: boolean;

    constructor(url: string | URL, protocols?: string | string[]) {
      super(url, protocols);
      this._udt_id = generateId();
      
      // FILTER CHECK - также фильтруем Vite HMR (обычно содержит vite-hmr)
      const urlStr = url.toString();
      this._udt_ignored = shouldIgnoreUrl(urlStr) || urlStr.includes('vite-hmr');
      
      if (this._udt_ignored) return;
      
      const startTime = Date.now();

      bridge.send('ws-open', {
        id: this._udt_id,
        url: url.toString(),
        startTime,
        type: 'websocket',
      });

      // Outgoing
      const originalSend = this.send;
      this.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
        if (!this._udt_ignored) {
          bridge.send('ws-frame', {
            id: this._udt_id,
            frame: {
              id: generateId(),
              time: Date.now(),
              type: 'send',
              data: typeof data === 'object' && !(data instanceof ArrayBuffer) ? '[Binary Data]' : String(data),
            },
          });
        }
        return originalSend.call(this, data);
      };

      // Incoming
      this.addEventListener('message', (e) => {
        if (!this._udt_ignored) {
          bridge.send('ws-frame', {
            id: this._udt_id,
            frame: {
              id: generateId(),
              time: Date.now(),
              type: 'received',
              data: typeof e.data === 'object' ? '[Binary Data]' : String(e.data),
            },
          });
        }
      });

      this.addEventListener('close', (e) => {
        if (!this._udt_ignored) {
          bridge.send('ws-close', {
            id: this._udt_id,
            endTime: Date.now(),
            code: e.code,
            reason: e.reason,
          });
        }
      });

      this.addEventListener('error', () => {
        if (!this._udt_ignored) {
          bridge.send('ws-error', {
            id: this._udt_id,
            error: 'WebSocket Error',
            endTime: Date.now(),
          });
        }
      });
    }
  };
};

// --- PATCH EVENTSOURCE (SSE) ---
const OriginalEventSource = window.EventSource;
const createEventSourcePatcher = (bridge: AppBridge<NetworkProtocol>) => {
  return class PatchedEventSource extends OriginalEventSource {
    _udt_id: string;
    _udt_ignored: boolean;

    constructor(url: string | URL, eventSourceInitDict?: EventSourceInit) {
      super(url, eventSourceInitDict);
      this._udt_id = generateId();
      
      // FILTER CHECK - Vite HMR иногда использует EventSource
      const urlStr = url.toString();
      this._udt_ignored = shouldIgnoreUrl(urlStr);
      
      if (this._udt_ignored) return;
      
      const startTime = Date.now();

      bridge.send('ws-open', {
        id: this._udt_id,
        url: urlStr,
        startTime,
        type: 'eventsource',
      });

      this.addEventListener('message', (e) => {
        // SSE может иметь event type
        const eventType = (e as any).type || 'message';
        const dataStr = typeof e.data === 'string' ? e.data : '[Binary Data]';
        bridge.send('ws-frame', {
          id: this._udt_id,
          frame: {
            id: generateId(),
            time: Date.now(),
            type: 'received',
            data: eventType !== 'message' ? `[${eventType}] ${dataStr}` : dataStr,
          },
        });
      });

      this.addEventListener('error', () => {
        // SSE tries to reconnect, so we don't always close
        bridge.send('ws-error', {
          id: this._udt_id,
          error: 'EventSource Error (Reconnecting...)',
          endTime: Date.now(),
        });
      });
      
      // Hook close explicitly if called by user
      const originalClose = this.close;
      this.close = () => {
        bridge.send('ws-close', {
          id: this._udt_id,
          endTime: Date.now(),
          reason: 'Closed by client',
        });
        originalClose.call(this);
      };
    }
  };
};

// --- PERFORMANCE OBSERVER (Resources: img, css, script) ---
// Ловит то, что не проходит через JS (статику в HTML)
const startResourceObserver = (bridge: AppBridge<NetworkProtocol>) => {
  if (!window.PerformanceObserver) return () => {};

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const res = entry as PerformanceResourceTiming;
        
        // Фильтруем запросы самого devtools (xmlhttprequest/fetch уже перехвачены)
        if (res.initiatorType === 'xmlhttprequest' || res.initiatorType === 'fetch' || res.initiatorType === 'beacon') {
          return;
        }

        // FILTER CHECK - используем общую функцию фильтрации
        if (shouldIgnoreUrl(res.name)) {
          return;
        }

        const id = generateId();
        bridge.send('request-start', {
          id,
          url: res.name,
          method: 'GET', // Resources are usually GET
          type: 'resource',
          subType: 'http',
          startTime: res.startTime + performance.timeOrigin, // Convert to Unix timestamp
          requestHeaders: {}, // Headers unavailable via Performance API
        });

        bridge.send('request-end', {
          id,
          status: 200, // Assume success if loaded (Performance API doesn't show status code)
          statusText: 'OK',
          endTime: res.responseEnd + performance.timeOrigin,
          duration: res.duration,
        });

        // Send size info if available
        if (res.transferSize > 0) {
          bridge.send('request-details', {
            id,
            responseBody: `[Resource Content]\nType: ${res.initiatorType}\nSize: ${res.transferSize} bytes\nDecoded: ${res.decodedBodySize} bytes\nDuration: ${res.duration.toFixed(2)}ms`,
            responseHeaders: {},
          });
        }
      }
    });
  });

  try {
    observer.observe({ type: 'resource', buffered: true });
  } catch (e) {
    // PerformanceObserver may not be supported
    console.warn('[Network] PerformanceObserver not supported');
  }

  return () => observer.disconnect();
};

// --- PATCH WEBTRANSPORT (HTTP/3) ---
const createWebTransportPatcher = (bridge: AppBridge<NetworkProtocol>) => {
  const OriginalWebTransport = (window as any).WebTransport;
  if (!OriginalWebTransport) return null;

  return class PatchedWebTransport extends OriginalWebTransport {
    _udt_id: string;
    _udt_ignored: boolean;

    constructor(url: string, options?: any) {
      super(url, options);
      this._udt_id = generateId();
      
      // FILTER CHECK
      this._udt_ignored = shouldIgnoreUrl(url);
      if (this._udt_ignored) return;
      
      const startTime = Date.now();

      bridge.send('ws-open', {
        id: this._udt_id,
        url: url,
        startTime,
        type: 'webtransport',
      });

      // Monitor Ready state
      this.ready.then(() => {
        // Connection established
      }).catch((e: any) => {
        if (!this._udt_ignored) {
          bridge.send('ws-error', {
            id: this._udt_id,
            error: `Connection Failed: ${e.message}`,
            endTime: Date.now()
          });
        }
      });

      // Monitor Close
      this.closed.then(() => {
        if (!this._udt_ignored) {
          bridge.send('ws-close', {
            id: this._udt_id,
            endTime: Date.now(),
            reason: 'Clean close'
          });
        }
      }).catch((e: any) => {
        if (!this._udt_ignored) {
          bridge.send('ws-close', {
            id: this._udt_id,
            endTime: Date.now(),
            reason: `Closed with error: ${e.message}`
          });
        }
      });

      // Note: Intercepting streams (createBidirectionalStream) is complex 
      // due to Streams API nature, but we track the connection lifecycle.
    }
  };
};

export default defineApp({
  component: undefined,
  setup({ bridge: bridgeInstance, onCleanup }) {
    const bridge = bridgeInstance as AppBridge<NetworkProtocol>;
    setupDevTools({ bridge });
    
    // Patch fetch and XHR with bridge
    window.fetch = createFetchPatcher(bridge);
    const originalSend = createXHRPatcher(bridge);
    
    // Patch Beacon, WebSocket, EventSource
    navigator.sendBeacon = createBeaconPatcher(bridge);
    window.WebSocket = createWebSocketPatcher(bridge) as typeof WebSocket;
    window.EventSource = createEventSourcePatcher(bridge) as typeof EventSource;
    
    // Patch WebTransport (if available)
    let originalWebTransport: typeof WebTransport | undefined;
    if ((window as any).WebTransport) {
      originalWebTransport = (window as any).WebTransport;
      const PatchedWebTransport = createWebTransportPatcher(bridge);
      if (PatchedWebTransport) {
        (window as any).WebTransport = PatchedWebTransport;
      }
    }
    
    // Start Performance Observer for resources
    const stopObserver = startResourceObserver(bridge);
    
    // Listen for rule updates from Client
    bridge.on('update-mock-rules', (rules) => {
      activeRules = rules.filter((r) => r.active);
      console.log('[U-DevTools] Mock rules updated:', activeRules.length);
    });

    // --- REPLAY LOGIC ---
    // Listen for command from UI to replay request
    bridge.on('replay', async (data) => {
      const { url, method, headers, body } = data;

      console.log('[U-DevTools] Replaying request:', method, url);

      try {
        await originalFetch(url, {
          method,
          headers: headers || {},
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (e) {
        console.error('[U-DevTools] Replay failed', e);
      }
    });

    // --- CLEANUP ---
    onCleanup(() => {
      console.log('[Network] Cleaning up patches');
      window.fetch = originalFetch;
      XHR.prototype.open = originalOpen;
      XHR.prototype.send = originalSend;
      XHR.prototype.setRequestHeader = originalSetHeader;
      navigator.sendBeacon = originalBeacon;
      window.WebSocket = OriginalWebSocket;
      window.EventSource = OriginalEventSource;
      if (originalWebTransport) {
        (window as any).WebTransport = originalWebTransport;
      }
      stopObserver();
    });
  },
});
