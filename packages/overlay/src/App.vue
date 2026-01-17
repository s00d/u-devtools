<script setup lang="ts">
import { shallowRef, watch, onMounted, onUnmounted } from 'vue';
import { useDevToolsState } from './composables/useDevToolsState';
import { useResizable } from '@u-devtools/ui';
import { devtools, AppBridge, type OverlayMenuItem } from '@u-devtools/core';
import Launcher from './components/Launcher.vue';

import { appPlugins } from 'virtual:u-devtools-app';

const props = defineProps<{ base: string }>();

const { isOpen, height } = useDevToolsState();

// Тип для внутреннего состояния компонента
interface MountedPlugin {
  name: string;
  component: any;
  bridge: AppBridge<any>;
}

// Храним функции очистки для каждого плагина
const cleanupRegistry: (() => void)[] = [];

// --- Инициализация Плагинов ---
const mountedPlugins = shallowRef<MountedPlugin[]>([]);

onMounted(() => {
  // Инициализируем глобальный массив меню, если его нет
  if (!window.__UDEVTOOLS_MENU_ITEMS__) {
    window.__UDEVTOOLS_MENU_ITEMS__ = [];
  }

  // appPlugins теперь типизирован как AppPluginEntry[]
  mountedPlugins.value = appPlugins
    .map((p) => {
      const def = p.definition;
      if (!def) return null;

      // AppBridge автоматически нормализует имя к lowercase для namespace
      // но сохраняет оригинальное имя в displayName для UI
      const bridge = new AppBridge(p.name);

      // Функция регистрации очистки
      const onCleanup = (fn: () => void) => {
        cleanupRegistry.push(fn);
      };
      
      // Автоматическая очистка моста
      onCleanup(() => bridge.close());

      // Автоматическая регистрация меню из декларативной конфигурации
      if (def.menu) {
        const menuConfig = def.menu;
        const menuItem: OverlayMenuItem = {
          id: menuConfig.id,
          label: menuConfig.label,
          icon: menuConfig.icon,
          order: menuConfig.order,
          onClick: (ctx) => {
            if (typeof menuConfig.action === 'string') {
              // Если action - строка, отправляем событие через bridge
              bridge.send(menuConfig.action as any);
            } else if (typeof menuConfig.action === 'function') {
              // Если action - функция, вызываем с контекстом
              menuConfig.action(ctx);
            }
          },
        };
        
        // Добавляем в глобальный массив
        const menuItems = window.__UDEVTOOLS_MENU_ITEMS__;
        if (menuItems) {
          const existingIdx = menuItems.findIndex((i) => i.id === menuItem.id);
          if (existingIdx !== -1) {
            menuItems[existingIdx] = menuItem;
          } else {
            menuItems.push(menuItem);
          }
        }
        
        // Отправляем событие для обратной совместимости
        window.dispatchEvent(
          new CustomEvent('u-devtools:register-menu-item', {
            detail: menuItem,
          })
        );
      }

      // Запускаем setup логику
      if (def.setup) {
        // Оборачиваем в try/catch чтобы ошибка в одном плагине не убила всё
        try {
          def.setup({ bridge, onCleanup });
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);
          const errorStack = e instanceof Error ? e.stack : undefined;
          console.error(
            `[u-devtools] Error setting up plugin "${p.name}":\n` +
            `Error: ${errorMessage}\n` +
            (errorStack ? `Stack:\n${errorStack.split('\n').slice(0, 10).join('\n')}` : '')
          );
        }
      }

      return {
        name: p.name,
        component: def.component,
        bridge,
      };
    })
    .filter((p): p is MountedPlugin => p !== null);
});

// При размонтировании (например, при HMR обновлении самого Overlay)
// вызываем все функции очистки
onUnmounted(() => {
  cleanupRegistry.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.warn('[u-devtools] Cleanup error:', e);
    }
  });
  cleanupRegistry.length = 0;
});

// Resize Logic
const { onPointerDown } = useResizable(height, {
  direction: 'vertical',
  onResizeStart: () => {
    // onResizeStart
  },
  onResizeEnd: () => {
    // onResizeEnd
  },
});

// Body padding hack (чтобы контент не перекрывался)
// Сохраняем оригинальное значение для восстановления
const originalPaddingBottom = document.body.style.paddingBottom;

watch(
  [isOpen, height],
  ([open, h]) => {
    if (open) {
      document.body.style.paddingBottom = `${h}px`;
    } else {
      document.body.style.paddingBottom = '0px';
    }
  },
  { immediate: true }
);

// Cleanup при размонтировании
onUnmounted(() => {
  document.body.style.paddingBottom = originalPaddingBottom || '';
});

// Блокировка скролла страницы при наведении на DevTools
let originalOverflow = '';
let originalOverflowY = '';
let isHovering = false;

const blockPageScroll = () => {
  if (isHovering) return;
  isHovering = true;
  originalOverflow = document.body.style.overflow;
  originalOverflowY = document.body.style.overflowY;
  document.body.style.overflow = 'hidden';
  document.body.style.overflowY = 'hidden';
};

const unblockPageScroll = () => {
  if (!isHovering) return;
  isHovering = false;
  document.body.style.overflow = originalOverflow;
  document.body.style.overflowY = originalOverflowY;
};

// Слушаем сообщения от Iframe (например, кнопку закрытия внутри, toast)
onMounted(() => {
  window.addEventListener('message', async (e) => {
    if (e.data === 'u-devtools:close' || (e.data && e.data.type === 'u-devtools:close')) {
      // Используем devtools.close() для синхронизации через BroadcastChannel
      devtools.close();
    } else if (e.data?.type === 'u-devtools:toast') {
      // Handle toast from iframe
      const { getOverlayLayer } = await import('./overlay-utils');
      const toastLayer = await getOverlayLayer('toast');
      
      const type = e.data.toastType || 'info';
      const message = e.data.message || '';
      
      // Create toast element
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        font-family: ui-sans-serif, system-ui, sans-serif;
        z-index: 10000;
        pointer-events: auto;
        max-width: 400px;
        word-wrap: break-word;
        animation: slideIn 0.3s ease-out;
      `;
      
      toast.textContent = message;
      toastLayer.appendChild(toast);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }
  });
});
</script>

<template>
  <!-- Корень Vue приложения -->
  <div class="udt-overlay-root">
    
    <!-- LAYER 1: PLUGINS SCENE (Инспекторы, сетки) -->
    <!-- Единый слой с правильным z-index и pointer-events: none -->
    <div class="udt-layer-plugins">
      <template v-for="plugin in mountedPlugins" :key="plugin.name">
        <!-- Рендерим компонент плагина, если он есть -->
        <!-- Контекст инициализируется в app.ts каждого плагина через setupDevTools -->
        <component v-if="plugin.component" :is="plugin.component" />
      </template>
    </div>

    <!-- LAYER 2: SHELL (Launcher, Iframe) -->
    <div class="udt-layer-shell">
      <!-- IFRAME CONTAINER (PANEL) -->
      <!-- Используем absolute bottom-0 вместо fixed, так как родитель уже растянут -->
      <div
        class="udt-panel-container"
        :class="isOpen ? 'udt-panel-open' : 'udt-panel-closed'"
        :style="{
          height: `${height}px`,
        }"
        @mouseenter="blockPageScroll"
        @mouseleave="unblockPageScroll"
      >
        <div class="udt-resizer" @pointerdown="onPointerDown" />
        <iframe 
          :src="`${props.base}/index.html`" 
          class="udt-iframe"
          title="Universal DevTools"
        />
      </div>

      <!-- LAUNCHER (Всегда рендерится, сам управляет своей видимостью) -->
      <Launcher />
    </div>

  </div>
</template>


