import { AppBridge } from '@u-devtools/core';

// Инициализация моста
const bridge = new AppBridge('network');

// Лог для проверки, что скрипт вообще загрузился
console.log('[U-DevTools] Network agent active');

// --- Хелперы ---
function generateId() {
  return Math.random().toString(36).slice(2);
}

function parseHeaders(headers: Headers | string): Record<string, string> {
  const result: Record<string, string> = {};
  if (headers instanceof Headers) {
    headers.forEach((val, key) => (result[key] = val));
  } else if (typeof headers === 'string') {
    headers.split(/[\r\n]+/).forEach(line => {
      const parts = line.split(': ');
      const key = parts.shift();
      if (key) result[key] = parts.join(': ');
    });
  }
  return result;
}

// --- PATCH FETCH ---
const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const id = generateId();
  const startTime = Date.now();
  
  let url = '';
  let method = 'GET';

  // Разбор аргументов fetch
  const [resource, config] = args;
  if (typeof resource === 'string') {
    url = resource;
  } else if (resource instanceof Request) {
    url = resource.url;
    method = resource.method;
  }
  
  if (config?.method) {
    method = config.method;
  }

  // 1. Отправляем Start
  bridge.send('request-start', {
    id,
    url,
    method: method.toUpperCase(),
    startTime
  });

  try {
    const response = await originalFetch(...args);

    // 2. Отправляем End
    bridge.send('request-end', {
      id,
      status: response.status,
      statusText: response.statusText,
      endTime: Date.now(),
      duration: Date.now() - startTime,
      // Можно добавить заголовки, если нужно
      // headers: parseHeaders(clone.headers) 
    });

    return response;
  } catch (error: any) {
    // 3. Отправляем Error
    bridge.send('request-error', {
      id,
      error: error.message || 'Network Error',
      endTime: Date.now(),
      duration: Date.now() - startTime
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
}

XHR.prototype.open = function (method: string, url: string | URL, ...args: any[]) {
  const xhr = this as PatchedXHR;
  xhr._udt_id = generateId();
  xhr._udt_method = method;
  xhr._udt_url = url.toString();
  
  // @ts-ignore
  return originalOpen.apply(this, [method, url, ...args]);
};

XHR.prototype.setRequestHeader = function (header: string, value: string) {
  // Тут можно сохранять заголовки запроса
  // @ts-ignore
  return originalSetHeader.apply(this, [header, value]);
};

XHR.prototype.send = function (body?: any) {
  const xhr = this as PatchedXHR;
  xhr._udt_start = Date.now();

  // 1. Start
  if (xhr._udt_id) {
    bridge.send('request-start', {
      id: xhr._udt_id,
      url: xhr._udt_url,
      method: (xhr._udt_method || 'GET').toUpperCase(),
      startTime: xhr._udt_start
    });
  }

  // Слушаем завершение
  xhr.addEventListener('loadend', () => {
    if (!xhr._udt_id) return;
    
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

  // @ts-ignore
  return originalSend.apply(this, [body]);
};

// --- CLEANUP (HMR) ---
// Если этого не сделать, при каждом сохранении файла будут накладываться новые патчи
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    console.log('[U-DevTools] Network agent cleaning up');
    window.fetch = originalFetch;
    XHR.prototype.open = originalOpen;
    XHR.prototype.send = originalSend;
    XHR.prototype.setRequestHeader = originalSetHeader;
    bridge.close();
  });
}
