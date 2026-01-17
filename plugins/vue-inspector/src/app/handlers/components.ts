import { devtools, activeAppRecord } from '@vue/devtools-kit';
import type { AppBridge } from '@u-devtools/core';
import { normalizeComponentState } from '../utils/normalize';
import type { VueInspectorProtocol, ComponentTreeNode } from '../../types';

// Максимально безопасная сериализация
function safeSerialize(data: any) {
  try {
    return JSON.parse(JSON.stringify(data, (key, value) => {
      // 1. Игнорируем внутренние поля
      if (key && (key.startsWith('_') || key.startsWith('$'))) return undefined;
      // 2. BigInt не поддерживается в JSON
      if (typeof value === 'bigint') return value.toString();
      // 3. Функции и символы
      if (typeof value === 'function' || typeof value === 'symbol') return undefined;
      return value;
    }));
  } catch (e) {
    console.error('[Vue Inspector] Serialization failed', e);
    return null;
  }
}

// Нормализация узлов дерева, чтобы клиент не падал на undefined полях
function normalizeTreeNode(node: any): ComponentTreeNode {
  return {
    id: node.id || 'unknown',
    name: node.name || 'Anonymous',
    uid: node.uid, // Сохраняем uid для сопоставления
    file: node.file || '',
    tags: Array.isArray(node.tags) ? node.tags : [], // Гарантируем массив
    children: Array.isArray(node.children) 
      ? node.children.map(normalizeTreeNode) 
      : [],
    hasChildren: !!node.hasChildren || (node.children && node.children.length > 0),
    inactive: !!node.inactive,
    isFragment: !!node.isFragment,
    autoOpen: !!node.autoOpen
  };
}

export function registerComponentHandlers(
  bridge: AppBridge<VueInspectorProtocol>,
  checkConnection: () => boolean
) {
  // --- APPS LIST ---
  bridge.on('inspector:getAppsList', () => {
    try {
      // @ts-ignore
      const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      if (!hook || !hook.apps || hook.apps.length === 0) {
        bridge.send('inspector:appsList', []);
        return;
      }

      const apps = hook.apps.map((app: any, index: number) => ({
        id: `app-${index + 1}`,
        name: app._instance?.type?.name || app._instance?.type?.__name || `App ${index + 1}`,
        version: app.version || 'unknown',
      }));

      bridge.send('inspector:appsList', apps);
    } catch (e) {
      console.error('[Vue Inspector] getAppsList error:', e);
      bridge.send('inspector:appsList', []);
    }
  });

  // --- SWITCH APP ---
  bridge.on('inspector:switchApp', (payload: { appId: string }) => {
    try {
      // @ts-ignore
      const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
      if (!hook || !hook.apps) {
        return;
      }

      // Извлекаем номер приложения из ID (например, "app-1" -> 0)
      const match = payload.appId.match(/^app-(\d+)$/);
      if (!match) {
        console.warn('[Vue Inspector] Invalid app ID format:', payload.appId);
        return;
      }

      const appIndex = parseInt(match[1], 10) - 1;
      if (appIndex < 0 || appIndex >= hook.apps.length) {
        console.warn('[Vue Inspector] App index out of range:', appIndex);
        return;
      }

      const app = hook.apps[appIndex];
      if (!app) {
        return;
      }

      // Переключаем активное приложение через Vue DevTools Kit API
      // Используем setActiveAppRecord если доступен, иначе напрямую устанавливаем
      try {
        // @ts-ignore
        activeAppRecord.value = {
          app,
          // @ts-ignore
          api: app._instance,
          version: app.version || 'unknown',
          types: {},
        };
      } catch (e) {
        console.error('[Vue Inspector] Failed to set activeAppRecord:', e);
      }

      // Отправляем событие готовности с новыми данными
      const hasPinia = !!app.config?.globalProperties?.$pinia;
      const hasRouter = !!app.config?.globalProperties?.$router;
      
      bridge.send('inspector:ready', {
        vueVersion: app.version || 'unknown',
        hasPinia,
        hasRouter,
      });

      // Не отправляем запрос дерева отсюда - клиент сам запросит после получения события ready
    } catch (e) {
      console.error('[Vue Inspector] switchApp error:', e);
    }
  });
  // --- TREE ---
  bridge.on('inspector:getComponentTree', (payload: any) => {
    (async () => {
      // Все запросы идут через bridge от клиента
      if (!checkConnection()) {
        bridge.send('inspector:componentTree', []);
        return;
      }

      try {
        // Если указан appId, переключаемся на это приложение перед запросом
        if (payload.appId) {
          // @ts-ignore
          const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
          if (hook && hook.apps) {
            const match = payload.appId.match(/^app-(\d+)$/);
            if (match) {
              const appIndex = parseInt(match[1], 10) - 1;
              if (appIndex >= 0 && appIndex < hook.apps.length) {
                const app = hook.apps[appIndex];
                if (app) {
                  // @ts-ignore
                  activeAppRecord.value = {
                    app,
                    // @ts-ignore
                    api: app._instance,
                    version: app.version || 'unknown',
                    types: {},
                  };
                }
              }
            }
          }
        }

        // Запрос дерева компонентов через Vue DevTools Kit API
        const tree = await devtools.ctx.api.getInspectorTree({
          inspectorId: 'components',
          filter: payload.filter || '',
        });
        
        // Нормализуем дерево перед отправкой
        const safeTree = (tree || []).map(normalizeTreeNode);
        const serialized = safeSerialize(safeTree);
        
        // Отправляем результат обратно клиенту через bridge
        bridge.send('inspector:componentTree', serialized || []);
      } catch (e) {
        console.error('[Vue Inspector] getComponentTree error:', e);
        bridge.send('inspector:componentTree', []);
      }
    })();
  });

  // --- STATE ---
  bridge.on('inspector:getComponentState', (payload: any) => {
    (async () => {
      // Отправляем ответ даже при ошибке, чтобы снять лоадер
      const sendEmpty = () => {
        bridge.send('inspector:componentState', null);
      };

      if (!checkConnection()) {
        return sendEmpty();
      }
      
      try {
        // Если указан appId, переключаемся на это приложение перед запросом
        if (payload.appId) {
          // @ts-ignore
          const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
          if (hook && hook.apps) {
            const match = payload.appId.match(/^app-(\d+)$/);
            if (match) {
              const appIndex = parseInt(match[1], 10) - 1;
              if (appIndex >= 0 && appIndex < hook.apps.length) {
                const app = hook.apps[appIndex];
                if (app) {
                  // @ts-ignore
                  activeAppRecord.value = {
                    app,
                    // @ts-ignore
                    api: app._instance,
                    version: app.version || 'unknown',
                    types: {},
                  };
                }
              }
            }
          }
        }
        
        // Сначала проверяем, существует ли компонент в дереве
        // Это важно, потому что компонент может быть еще не загружен или уже размонтирован
        // Все запросы идут через bridge от клиента
        let componentExists = false;
        try {
          const tree = await devtools.ctx.api.getInspectorTree({
            inspectorId: 'components',
            filter: '',
          });
          
          // Рекурсивно проверяем наличие компонента с таким id
          const findNode = (nodes: any[]): boolean => {
            for (const node of nodes || []) {
              if (node?.id === payload.id) {
                return true;
              }
              if (node?.children && Array.isArray(node.children)) {
                if (findNode(node.children)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          componentExists = tree && Array.isArray(tree) && findNode(tree);
          
          if (!componentExists) {
            return sendEmpty();
          }
        } catch (treeError) {
          // Продолжаем попытку получить состояние даже если проверка дерева не удалась
        }
        
        // Небольшая задержка для гарантии, что данные компонента доступны
        // Это особенно важно при быстром переключении между компонентами
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Оборачиваем вызов в Promise с обработкой ошибок
        // Ошибки могут происходить внутри Vue DevTools Kit при обработке невалидных данных компонента
        let state: any;
        try {
          state = await devtools.ctx.api.getInspectorState({
            inspectorId: 'components',
            nodeId: payload.id,
          });
        } catch (apiError) {
          // Игнорируем ошибки - они могут возникать из-за невалидных данных компонента
          return sendEmpty();
        }
        
        if (!state) {
          return sendEmpty();
        }

        // Безопасная проверка и фильтрация stateArray перед нормализацией
        if (state.state && Array.isArray(state.state)) {
          state.state = state.state.filter((item: any) => {
            if (item == null || typeof item !== 'object') {
              return false;
            }
            // Проверяем наличие хотя бы одного из обязательных полей
            return ('key' in item) || ('type' in item) || ('value' in item);
          });
        }

        let normalized: any;
        try {
          normalized = normalizeComponentState(state);
        } catch (normalizeError) {
          console.error('[Vue Inspector] Normalization failed:', normalizeError);
          return sendEmpty();
        }
        
        let cleanState: any;
        try {
          cleanState = safeSerialize(normalized);
        } catch (serializeError) {
          console.error('[Vue Inspector] Serialization failed:', serializeError);
          return sendEmpty();
        }
        
        // Отправляем результат обратно клиенту через bridge
        bridge.send('inspector:componentState', cleanState);
      } catch (e) {
        console.error('[Vue Inspector] Error getting state:', e);
        console.error('[Vue Inspector] Error stack:', e instanceof Error ? e.stack : 'no stack');
        sendEmpty();
      }
    })();
  });

  // --- EDIT COMPONENT STATE ---
  bridge.on('inspector:editState', (payload: Parameters<VueInspectorProtocol['inspector:editState']>[0]) => {
    (async () => {
      if (!checkConnection()) return;
      try {
        // editInspectorState expects a state object with value property
        // The API will add app and set function automatically
        devtools.ctx.api.editInspectorState({
          inspectorId: payload.inspectorId,
          nodeId: payload.nodeId,
          path: payload.path,
          state: {
            value: payload.value,
          } as any, // Type assertion needed as API adds app and set internally
          type: payload.type,
        } as any);
        // Refresh state after edit
        const state = await devtools.ctx.api.getInspectorState({
          inspectorId: payload.inspectorId,
          nodeId: payload.nodeId,
        });
        const cleanState = safeSerialize(state || null);
        bridge.send('inspector:componentState', cleanState);
      } catch (e) {
        console.error(`[Vue Inspector] editState error: ${e instanceof Error ? e.message : String(e)}`);
      }
    })();
  });

  // --- ACTIONS (Highlight/Scroll) ---
  bridge.on('inspector:scrollToComponent', (payload: { id: string }) => {
    if (!checkConnection()) return;
    try {
      devtools.ctx.api.scrollToComponent(payload.id);
    } catch {}
  });

  bridge.on('inspector:highlight', (payload: { id: string }) => {
    if (!checkConnection()) return;
    try {
      devtools.ctx.api.scrollToComponent(payload.id);
    } catch {}
  });

  bridge.on('inspector:unhighlight', () => {
    if (!checkConnection()) return;
    try {
      devtools.ctx.api.cancelInspectComponentInspector();
    } catch {}
  });

  // --- GET COMPONENT RENDER CODE ---
  bridge.on('inspector:getComponentRenderCode', (payload: Parameters<VueInspectorProtocol['inspector:getComponentRenderCode']>[0]) => {
    (async () => {
      if (!checkConnection()) return;
      try {
        const code = devtools.ctx.api.getComponentRenderCode?.(payload.nodeId) || '';
        bridge.send('inspector:componentRenderCode', { code });
      } catch (e) {
        console.error(
          `[Vue Inspector] getComponentRenderCode error: ${e instanceof Error ? e.message : String(e)}`
        );
        bridge.send('inspector:componentRenderCode', { code: '' });
      }
    })();
  });

  // --- INSPECT COMPONENT INSPECTOR ---
  bridge.on('inspector:inspectComponentInspector', () => {
    (async () => {
      if (!checkConnection()) return;
      try {
        const data = await devtools.ctx.api.inspectComponentInspector();
        bridge.send('inspector:inspectComponentInspector:result', {
          data: data ? JSON.parse(data) : null,
        });
      } catch (e) {
        console.error(
          `[Vue Inspector] inspectComponentInspector error: ${e instanceof Error ? e.message : String(e)}`
        );
        bridge.send('inspector:inspectComponentInspector:result', { data: null });
      }
    })();
  });

  bridge.on('inspector:cancelInspectComponentInspector', () => {
    if (!checkConnection()) return;
    try {
      devtools.ctx.api.cancelInspectComponentInspector();
    } catch (e) {
      console.error(
        `[Vue Inspector] cancelInspectComponentInspector error: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  });
}

