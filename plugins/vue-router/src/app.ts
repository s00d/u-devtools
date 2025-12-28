import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('vue-router');

interface RouteInfo {
  path: string;
  name?: string;
  meta?: Record<string, unknown>;
  active?: boolean;
}

function findRouter() {
  // Пытаемся найти роутер через глобальные свойства Vue приложения
  // Это хак, но часто работает в dev mode
  const app = (window as any).__VUE_APP__;

  // Если пользователь явно передал роутер через window (надежнее)
  if ((window as any).__U_DEVTOOLS_VUE_ROUTER__) {
    return (window as any).__U_DEVTOOLS_VUE_ROUTER__;
  }

  // Попытка найти через document (если роутер зарегистрирован глобально)
  // Это менее надежно, но может сработать
  if (app && app.config?.globalProperties?.$router) {
    return app.config.globalProperties.$router;
  }

  return null;
}

function init() {
  const router = findRouter();
  if (!router) {
    bridge.send('router:error', {
      message: 'Vue Router instance not found. Please register it via window.__U_DEVTOOLS_VUE_ROUTER__ = router',
    });
    return;
  }

  // Отправляем список всех маршрутов
  try {
    const routes = router.getRoutes().map((r: any) => ({
      path: r.path,
      name: r.name,
      meta: r.meta || {},
      active: router.currentRoute.value.path === r.path,
    }));

    bridge.send('router:list', routes);

    // Слушаем изменения маршрута
    router.afterEach((to: any, from: any) => {
      bridge.send('router:change', {
        path: to.path,
        name: to.name,
        params: to.params,
        query: to.query,
        meta: to.meta,
        from: {
          path: from.path,
          name: from.name,
        },
      });

      // Обновляем список маршрутов с новым активным
      const updatedRoutes = router.getRoutes().map((r: any) => ({
        path: r.path,
        name: r.name,
        meta: r.meta || {},
        active: r.path === to.path,
      }));

      bridge.send('router:list', updatedRoutes);
    });
  } catch (error) {
    bridge.send('router:error', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

// Пробуем инициализироваться с задержкой, чтобы Vue успел загрузиться
let attempts = 0;
const maxAttempts = 10;

function tryInit() {
  attempts++;
  const router = findRouter();
  if (router) {
    init();
  } else if (attempts < maxAttempts) {
    setTimeout(tryInit, 500);
  } else {
    bridge.send('router:error', {
      message: 'Vue Router not found after multiple attempts. Make sure router is registered.',
    });
  }
}

// Начинаем попытки инициализации
setTimeout(tryInit, 100);

