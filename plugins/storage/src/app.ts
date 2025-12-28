import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('storage');

interface StorageItem {
  key: string;
  value: string;
}

function scanStorage(type: 'localStorage' | 'sessionStorage'): StorageItem[] {
  try {
    const storage = type === 'localStorage' ? window.localStorage : window.sessionStorage;
    return Object.entries(storage).map(([key, value]) => ({ key, value }));
  } catch {
    return [];
  }
}

function scanCookies(): StorageItem[] {
  try {
    return document.cookie.split(';').map((cookie) => {
      const [key, ...valueParts] = cookie.trim().split('=');
      return { key, value: valueParts.join('=') || '' };
    }).filter(item => item.key);
  } catch {
    return [];
  }
}

function sendAll() {
  bridge.send('storage:data', {
    localStorage: scanStorage('localStorage'),
    sessionStorage: scanStorage('sessionStorage'),
    cookies: scanCookies(),
  });
}

// Отправляем данные при загрузке
sendAll();

// Слушаем изменения localStorage/sessionStorage
const storageHandler = () => {
  sendAll();
};
window.addEventListener('storage', storageHandler);

// Периодически проверяем (так как storage event срабатывает только между вкладками)
const intervalId = setInterval(sendAll, 2000);

// Перехватываем изменения через Proxy (опционально, для отслеживания изменений в текущей вкладке)
const originalSetItem = Storage.prototype.setItem;
const originalRemoveItem = Storage.prototype.removeItem;
const originalClear = Storage.prototype.clear;

Storage.prototype.setItem = function(key: string, value: string) {
  originalSetItem.call(this, key, value);
  sendAll();
};

Storage.prototype.removeItem = function(key: string) {
  originalRemoveItem.call(this, key);
  sendAll();
};

Storage.prototype.clear = function() {
  originalClear.call(this);
  sendAll();
};

// --- CLEANUP (ВАЖНО!) ---
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Восстанавливаем оригинальные методы Storage
    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.removeItem = originalRemoveItem;
    Storage.prototype.clear = originalClear;
    
    // Удаляем слушатель storage event
    window.removeEventListener('storage', storageHandler);
    
    // Останавливаем интервал
    clearInterval(intervalId);
    
    // Закрываем канал
    bridge.close();
  });
}

