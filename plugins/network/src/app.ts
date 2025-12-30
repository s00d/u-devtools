import { AppBridge } from '@u-devtools/core';

// Инициализация моста
const bridge = new AppBridge('network');

// --- Хелперы ---
function generateId() {
  return Math.random().toString(36).slice(2);
}

function parseHeaders(headers: Headers | string): Record<string, string> {
  const res: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((v, k) => (res[k] = v));
  } else if (typeof headers === 'string') {
    headers.split(/[\r\n]+/).forEach((line) => {
      const parts = line.split(': ');
      const key = parts.shift();
      if (key) res[key] = parts.join(': ');
    });
  }
  return res;
}

// Хелпер для безопасного чтения тела
async function readBody(response: Response) {
  try {
    const clone = response.clone();
    const text = await clone.text();
    try {
      return JSON.parse(text); // Если JSON, возвращаем объект
    } catch {
      return text; // Иначе строку
    }
  } catch {
    return '[Stream or Binary data]';
  }
}

// --- PATCH FETCH ---
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = typeof resource === 'string' ? resource : resource instanceof Request ? resource.url : String(resource);
  const method = config?.method || (resource instanceof Request ? resource.method : 'GET');
  const startTime = Date.now();
  const id = generateId();

  const requestHeaders = config?.headers ? parseHeaders(new Headers(config.headers)) : {};
  // Пытаемся сохранить тело запроса (если строка)
  let requestBody: unknown = config?.body;
  if (typeof requestBody === 'string') {
    try { 
      requestBody = JSON.parse(requestBody); 
    } catch { 
      // Оставляем как строку
    }
  }

  bridge.send('request-start', {
    id,
    url,
    method: method.toUpperCase(),
    startTime,
    requestHeaders,
    requestBody
  });

  try {
    const response = await originalFetch(...args);
    
    // Читаем ответ асинхронно, не блокируя возврат
    readBody(response).then((body) => {
      bridge.send('request-details', {
        id,
        responseBody: body,
        responseHeaders: parseHeaders(response.headers)
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

// --- PATCH XHR ---
const XHR = window.XMLHttpRequest;
const originalOpen = XHR.prototype.open;
const originalSend = XHR.prototype.send;
const originalSetHeader = XHR.prototype.setRequestHeader;

// Расширяем интерфейс XHR для хранения наших данных
interface PatchedXHR extends XMLHttpRequest {
  _udt_id?: string;
  _udt_method?: string;
  _udt_url?: string;
  _udt_start?: number;
  _udt_requestHeaders?: Record<string, string>;
  _udt_requestBody?: unknown;
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
  if (!xhr._udt_requestHeaders) {
    xhr._udt_requestHeaders = {};
  }
  xhr._udt_requestHeaders[header] = value;
  return originalSetHeader.apply(this, [header, value]);
};

XHR.prototype.send = function (body?: unknown) {
  const xhr = this as PatchedXHR;
  xhr._udt_start = Date.now();

  // Сохраняем тело
  if (typeof body === 'string') {
    try { 
      xhr._udt_requestBody = JSON.parse(body); 
    } catch { 
      xhr._udt_requestBody = body; 
    }
  } else {
    xhr._udt_requestBody = body; // FormData или Blob сложно сериализовать
  }

  // 1. Start
  if (xhr._udt_id) {
    bridge.send('request-start', {
      id: xhr._udt_id,
      url: xhr._udt_url,
      method: (xhr._udt_method || 'GET').toUpperCase(),
      startTime: xhr._udt_start,
      requestHeaders: xhr._udt_requestHeaders || {},
      requestBody: xhr._udt_requestBody
    });
  }

  // Слушаем завершение
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
      // Оставляем как есть
    }

    bridge.send('request-details', {
      id: xhr._udt_id,
      responseBody: responseBody,
      responseHeaders: parseHeaders(xhr.getAllResponseHeaders())
    });
    
    bridge.send('request-end', {
      id: xhr._udt_id,
      status: xhr.status,
      statusText: xhr.statusText,
      endTime: Date.now(),
      duration: Date.now() - (xhr._udt_start || 0),
    });
  });

  // Слушаем ошибку (сетевую)
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

// --- REPLAY LOGIC ---
// Слушаем команду от UI, чтобы повторить запрос
bridge.on('replay', async (data: unknown) => {
  const { url, method, headers, body } = data as { 
    url: string; 
    method: string; 
    headers?: Record<string, string>; 
    body?: unknown;
  };
  
  console.log('[U-DevTools] Replaying request:', method, url);
  
  try {
    await originalFetch(url, {
      method,
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    console.error('[U-DevTools] Replay failed', e);
  }
});

// --- CLEANUP (HMR) ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hot = (import.meta as any).hot;
if (hot) {
  hot.dispose(() => {
    console.log('[U-DevTools] Network agent cleaning up');
    window.fetch = originalFetch;
    XHR.prototype.open = originalOpen;
    XHR.prototype.send = originalSend;
    XHR.prototype.setRequestHeader = originalSetHeader;
    bridge.close();
  });
}
