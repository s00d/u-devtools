---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, ClientApi, AppBridge } from '@u-devtools/core';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import { defineVueElements } from '@u-devtools/kit/web-components';
import {
  UButton,
  UCard,
  UInput,
  USelect,
  UBadge,
  UIcon,
  UTabs,
  UTabButtons,
  UModal,
  UCodeBlock,
  UJsonTree,
  UKeyValue,
  UStat,
  UTable,
  ULoading,
  UEmpty,
  UForm,
} from '@u-devtools/ui';
// @ts-ignore - Svelte component types
import SveltePanel from './ui/SveltePanel.svelte';

// Register Vue components as Web Components
defineVueElements([
  {
    tagName: 'u-button',
    component: UButton,
    options: {
      attributes: ['label', 'variant', 'icon', 'size', 'disabled'],
      emits: ['click'],
    },
  },
  {
    tagName: 'u-card',
    component: UCard,
    options: {
      attributes: ['title', 'subtitle'],
    },
  },
  {
    tagName: 'u-badge',
    component: UBadge,
    options: {
      attributes: ['label', 'color', 'variant'],
    },
  },
  {
    tagName: 'u-input',
    component: UInput,
    options: {
      attributes: ['placeholder', 'icon', 'size', 'modelValue'],
      emits: ['update:modelValue'],
    },
  },
  {
    tagName: 'u-select',
    component: USelect,
    options: {
      attributes: ['modelValue', 'options'],
      emits: ['update:modelValue'],
    },
  },
  {
    tagName: 'u-icon',
    component: UIcon,
    options: {
      attributes: ['name', 'size', 'solid'],
    },
  },
  {
    tagName: 'u-tabs',
    component: UTabs,
    options: {
      attributes: ['items', 'modelValue', 'maxVisible'],
      emits: ['update:modelValue'],
    },
  },
  {
    tagName: 'u-tab-buttons',
    component: UTabButtons,
    options: {
      attributes: ['items', 'modelValue'],
      emits: ['update:modelValue'],
    },
  },
  {
    tagName: 'u-modal',
    component: UModal,
    options: {
      attributes: ['visible', 'title'],
      emits: ['close'],
    },
  },
  {
    tagName: 'u-code-block',
    component: UCodeBlock,
    options: {
      attributes: ['code', 'language'],
    },
  },
  {
    tagName: 'u-json-tree',
    component: UJsonTree,
    options: {
      attributes: [],
    },
  },
  {
    tagName: 'u-key-value',
    component: UKeyValue,
    options: {
      attributes: ['label', 'value'],
    },
  },
  {
    tagName: 'u-stat',
    component: UStat,
    options: {
      attributes: ['label', 'value', 'color'],
    },
  },
  {
    tagName: 'u-table',
    component: UTable,
    options: {
      attributes: [],
    },
  },
  {
    tagName: 'u-loading',
    component: ULoading,
    options: {
      attributes: ['text'],
    },
  },
  {
    tagName: 'u-empty',
    component: UEmpty,
    options: {
      attributes: ['icon', 'title', 'description'],
    },
  },
  {
    tagName: 'u-form',
    component: UForm,
    options: {
      attributes: [],
      emits: ['update:modelValue'],
    },
  },
]);

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'CodeBracket',

  renderMain(container, api, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    // Проверяем, что мы в браузере
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('[Svelte Plugin] mount is only available in browser');
      return () => {
        bridge.close();
      };
    }

    // Динамически импортируем mount/unmount только в браузере
    return import('svelte')
      .then(({ mount, unmount }) => {
        // Используем mount из Svelte 5
        const app = mount(SveltePanel, {
          target: container,
        });

        return () => {
          unmount(app);
          bridge.close();
        };
      })
      .catch((err) => {
        console.error('[Svelte Plugin] Failed to mount:', err);
        return () => {
          bridge.close();
        };
      }) as any;
  },
};

export default plugin;
