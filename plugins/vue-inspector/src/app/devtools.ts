import { initDevTools, onDevToolsConnected, setDevToolsEnv, activeAppRecord } from '@vue/devtools-kit';
import type { AppBridge } from '@u-devtools/core';
import type { VueInspectorProtocol } from '../types';

export function initVueDevTools(bridge: AppBridge<VueInspectorProtocol>) {
  let isConnected = false;
  let hasPinia = false;
  let hasRouter = false;

  setDevToolsEnv({
    vitePluginDetected: true,
  });

  // 1. Инициализация хука
  initDevTools();

  // 2. Функция проверки наличия инспекторов
  function checkAvailableInspectors() {
    try {
      // Пытаемся получить инспекторы, чтобы понять, доступны ли они
      // getInspector бросает ошибку, если инспектор не найден? Обычно возвращает undefined.
      // Но в devtools-kit поведение может отличаться.
      // Проверяем наличие payload через API
      hasPinia = !!activeAppRecord.value?.app?.config?.globalProperties?.$pinia;
      hasRouter = !!activeAppRecord.value?.app?.config?.globalProperties?.$router;
    } catch {
      // Ignore errors
    }
  }

  // 3. Callback при подключении
  onDevToolsConnected(() => {
    console.log('[Vue Inspector] Connected to Vue App');
    isConnected = true;
    checkAvailableInspectors();
    
    // Получаем версию Vue
    const vueVersion = activeAppRecord.value?.app?.version || 'unknown';
    
    bridge.send('inspector:ready', {
      vueVersion,
      hasPinia,
      hasRouter,
    });
  });

  // --- ХАК: Принудительная проверка, если мы загрузились поздно ---
  // Если приложение уже работает, onDevToolsConnected может не сработать сразу.
  // Проверяем глобальный хук
  setTimeout(() => {
    if (!isConnected) {
      // @ts-ignore
      const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      
      if (hook && hook.apps && hook.apps.length > 0) {
        isConnected = true;
        
        // Эмулируем событие подключения для внутреннего состояния
        if (!activeAppRecord.value) {
          activeAppRecord.value = {
            app: hook.apps[0],
            // @ts-ignore
            api: hook.apps[0]._instance, // rough approximation
            version: hook.apps[0].version,
            types: {}
          } as any;
        }

        checkAvailableInspectors();
        
        const vueVersion = hook.apps[0].version || 'unknown';
        bridge.send('inspector:ready', {
          vueVersion,
          hasPinia,
          hasRouter
        });
      }
    }
  }, 1000);

  return {
    get isConnected() { return isConnected; },
    get hasPinia() { return hasPinia; },
    get hasRouter() { return hasRouter; },
  };
}

