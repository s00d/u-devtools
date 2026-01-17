import { activeAppRecord } from '@vue/devtools-kit';
import type { AppBridge } from '@u-devtools/core';
import type { VueInspectorProtocol } from '../../types';
import { serialize } from '@u-devtools/utils';

export function registerRouterHandlers(
  bridge: AppBridge<VueInspectorProtocol>,
  checkConnection: () => boolean
) {
  /**
   * Получаем экземпляр Router из активного приложения Vue
   */
  function getRouterInstance() {
  if (!activeAppRecord.value) return null;
  // Router обычно доступен в globalProperties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (activeAppRecord.value.app as any)?.config?.globalProperties?.$router;
}

/**
 * Формируем данные для отправки на клиент
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRouterPayload(router: any) {
  return {
    currentRoute: router.currentRoute.value,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    routes: router.getRoutes().map((r: any) => ({
      path: r.path,
      name: r.name,
      meta: r.meta,
      aliasOf: r.aliasOf ? r.aliasOf.path : undefined,
    })),
  };
  }
  
  // 1. Получение информации о роутере
  bridge.on('inspector:getRouterInfo', () => {
    if (!checkConnection()) {
      bridge.send('inspector:routerInfo', null);
      return;
    }

    const router = getRouterInstance();

    if (!router) {
      // Если роутера нет в проекте
      bridge.send('inspector:routerInfo', null);
      return;
    }

    try {
      const info = getRouterPayload(router);
      bridge.send('inspector:routerInfo', serialize(info));
    } catch (e) {
      console.error(
        `[Vue Inspector] getRouterInfo error: ${e instanceof Error ? e.message : String(e)}`
      );
      bridge.send('inspector:routerInfo', null);
    }
  });

  // 2. Навигация (переход на другой роут)
  bridge.on('inspector:navigateToRoute', (payload: Parameters<VueInspectorProtocol['inspector:navigateToRoute']>[0]) => {
    (async () => {
      if (!checkConnection()) return;

      const router = getRouterInstance();
      if (router) {
        try {
          await router.push(payload.path);
          
          // Отправляем обновленные данные после навигации
          // Небольшая задержка, чтобы хуки роутера успели отработать
          setTimeout(() => {
            const info = getRouterPayload(router);
            bridge.send('inspector:routerInfo', serialize(info));
          }, 100);
        } catch (e) {
          console.error(
            `[Vue Inspector] navigateToRoute error: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
    })();
  });
}

