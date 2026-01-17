import { defineApp } from '@u-devtools/kit';
import type { AppBridge } from '@u-devtools/core';
import { OVERLAY_ID, getOverlayHost } from '@u-devtools/overlay';
import type { VueInspectorProtocol } from './types';
import { setupDevTools } from './context';
import { initVueDevTools } from './app/devtools';
import { registerComponentHandlers } from './app/handlers/components';
import { registerRouterHandlers } from './app/handlers/router';
import { registerPiniaHandlers } from './app/handlers/pinia';
import { registerTimelineHandlers } from './app/handlers/timeline';
import { devtools, activeAppRecord } from '@vue/devtools-kit';

export default defineApp({
  component: undefined, // У этого плагина нет своего UI на странице

  // bridge приходит сюда из ядра Overlay
  setup({ bridge, onCleanup }) {
    const typedBridge = bridge as AppBridge<VueInspectorProtocol>;
    
    // Инициализируем контекст (в app контексте api нет)
    setupDevTools({ bridge: typedBridge });
    
    // Глобальный обработчик для перехвата ошибок внутри Vue DevTools Kit
    // Эти ошибки могут возникать при обработке невалидных данных компонентов
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const errorMsg = String(event.reason || '');
      // Перехватываем ошибки, связанные с getInspectorState и обработкой типа
      if (errorMsg.includes('Cannot read properties of undefined (reading \'type\')') ||
          (errorMsg.includes('type') && errorMsg.includes('getInspectorState'))) {
        // Тихо подавляем ошибку - это нормально для компонентов в нестабильном состоянии
        event.preventDefault(); // Предотвращаем вывод ошибки в консоль
      }
    };
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    
    // 1. Инициализируем DevTools Kit (передаем bridge)
    const devToolsState = initVueDevTools(typedBridge);
    
    // Хелперы для проверки состояния
    const checkConnection = () => devToolsState.isConnected;
    const hasPinia = () => devToolsState.hasPinia;
    const hasRouter = () => devToolsState.hasRouter;

    // 2. Регистрируем обработчики (внедряем зависимости)
    registerComponentHandlers(typedBridge, checkConnection);
    registerRouterHandlers(typedBridge, checkConnection);
    registerPiniaHandlers(typedBridge, checkConnection, hasPinia);
    registerTimelineHandlers(typedBridge, checkConnection);

    // --- CUSTOM INSPECTOR LOGIC ---
    let isInspecting = false;
    let hoveredInstance: any = null;
    
    // Флаг для блокировки событий сразу после выбора
    // Это предотвращает всплытие клика после отключения isInspecting
    let blockNextClick = false;

    const isDevToolsElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      if (el.id === OVERLAY_ID.HOST || el.closest(`#${OVERLAY_ID.HOST}`)) return true;
      const root = el.getRootNode();
      if (root instanceof ShadowRoot && root.host?.id === OVERLAY_ID.HOST) return true;
      return false;
    };

    const findElementUnderCursor = (x: number, y: number): HTMLElement | null => {
      const host = getOverlayHost();
      const prevDisplay = host ? host.style.display : '';
      if (host) host.style.display = 'none';
      const el = document.elementFromPoint(x, y) as HTMLElement;
      if (host) host.style.display = prevDisplay;
      
      if (!el || isDevToolsElement(el)) return null;
      return el;
    };

    const getVueInstance = (el: HTMLElement | null) => {
      while (el) {
        // @ts-ignore
        if (el.__vueParentComponent) return el.__vueParentComponent;
        el = el.parentElement;
      }
      return null;
    };

    // 1. MouseMove: Только подсветка, ничего не блокируем (кроме propagation)
    const onMouseMove = (e: MouseEvent) => {
      if (!isInspecting) return;
      
      e.stopPropagation();
      // e.preventDefault(); // Убираем preventDefault здесь, чтобы не мешать скроллу/ховеру

      const target = findElementUnderCursor(e.clientX, e.clientY);
      if (!target) return;

      const instance = getVueInstance(target);
      
      if (instance && instance !== hoveredInstance) {
        hoveredInstance = instance;
        try {
          const id = instance.uid.toString();
          devtools.ctx.api.scrollToComponent(id);
          // Включаем нативный инспектор для визуализации границ
          devtools.ctx.api.inspectComponentInspector();
        } catch (err) {}
      } else if (!instance && hoveredInstance) {
        hoveredInstance = null;
        try {
          devtools.ctx.api.cancelInspectComponentInspector();
        } catch {}
      }
    };

    // 2. MouseDown: Блокируем, чтобы ссылка не активировалась при нажатии
    const onMouseDown = (e: MouseEvent) => {
      if (isInspecting) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // 3. MouseUp: Здесь происходит выбор компонента
    const onMouseUp = (e: MouseEvent) => {
      if (!isInspecting) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const target = findElementUnderCursor(e.clientX, e.clientY);
      const instance = getVueInstance(target);

      if (instance) {
        // Определяем, какое приложение активно
        // @ts-ignore
        const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
        let appId: string | undefined;
        if (hook && hook.apps) {
          const currentApp = activeAppRecord.value?.app;
          if (currentApp) {
            const appIndex = hook.apps.findIndex((app: any) => app === currentApp);
            if (appIndex >= 0) {
              appId = `app-${appIndex + 1}`;
            }
          }
        }
        
        // Отправляем uid - клиент найдет правильный ID в дереве компонентов
        const uid = instance.uid;
        const id = String(uid);
        
        typedBridge.send('inspector:component-selected', { id, uid, appId });
        
        // Ставим флаг, что мы только что выбрали элемент
        blockNextClick = true;
        
        // Выключаем инспектор
        stopInspector();

        // Сбрасываем блокировку через небольшую задержку
        setTimeout(() => {
          blockNextClick = false;
        }, 300);
      }
    };

    // 4. Click: Самое важное место для предотвращения рефреша
    const onClick = (e: MouseEvent) => {
      // Блокируем если инспектор включен ИЛИ если мы только что выбрали элемент
      if (isInspecting || blockNextClick) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInspecting) {
        e.preventDefault();
        stopInspector();
      }
    };

    const startInspector = () => {
      isInspecting = true;
      blockNextClick = false; // Сбрасываем флаг при старте
      document.body.style.cursor = 'crosshair';
      // Используем capture: true, чтобы перехватить события до страницы
      window.addEventListener('mousemove', onMouseMove, { capture: true });
      window.addEventListener('mousedown', onMouseDown, { capture: true });
      window.addEventListener('mouseup', onMouseUp, { capture: true });
      window.addEventListener('click', onClick, { capture: true });
      window.addEventListener('keydown', onKeyDown, { capture: true });
    };

    const stopInspector = () => {
      isInspecting = false;
      hoveredInstance = null;
      document.body.style.cursor = '';
      
      window.removeEventListener('mousemove', onMouseMove, { capture: true });
      window.removeEventListener('mousedown', onMouseDown, { capture: true });
      window.removeEventListener('mouseup', onMouseUp, { capture: true });
      window.removeEventListener('click', onClick, { capture: true });
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      
      try {
        devtools.ctx.api.cancelInspectComponentInspector();
      } catch {}
      
      typedBridge.send('inspector:disabled', {});
    };

    // Слушаем команды от клиента
    typedBridge.on('inspector:enable', startInspector);
    typedBridge.on('inspector:disable', stopInspector);

    // 3. Очистка
    onCleanup(() => {
      stopInspector();
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    });
  },
});
