---
to: <%= projectName %>/src/client.ts
---
import type { PluginClientInstance, ClientApi, AppBridge } from '@u-devtools/core';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import { createVanillaPanel } from './ui/vanilla-panel.js';
import { defineVueElements } from '@u-devtools/kit/web-components';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>
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

// Register all UI components as Web Components (only once)
let componentsRegistered = false;

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'CodeBracket',

  renderMain(container, api, { bridge }) {
    // Инициализируем контекст (один раз!)
    setupDevTools({ api, bridge, toast: createToast() });
    
    // Register components only once
    if (!componentsRegistered) {
      defineVueElements([
        {
          tagName: 'u-button',
          component: UButton,
          options: { attributes: ['label', 'variant', 'icon', 'size', 'disabled'], emits: ['click'] },
        },
        {
          tagName: 'u-card',
          component: UCard,
          options: { attributes: ['title', 'subtitle'] },
        },
        {
          tagName: 'u-input',
          component: UInput,
          options: { attributes: ['model-value', 'placeholder', 'icon', 'type', 'size'], emits: ['update:modelValue'] },
        },
        {
          tagName: 'u-select',
          component: USelect,
          options: { attributes: ['model-value', 'placeholder'], emits: ['update:modelValue'] },
        },
        {
          tagName: 'u-badge',
          component: UBadge,
          options: { attributes: ['label', 'color', 'variant', 'size'] },
        },
        {
          tagName: 'u-icon',
          component: UIcon,
          options: { attributes: ['name', 'size', 'solid'] },
        },
        {
          tagName: 'u-tabs',
          component: UTabs,
          options: { emits: ['update:modelValue'] },
        },
        {
          tagName: 'u-tab-buttons',
          component: UTabButtons,
          options: { emits: ['update:modelValue'] },
        },
        {
          tagName: 'u-modal',
          component: UModal,
          options: { attributes: ['visible', 'title'], emits: ['close'] },
        },
        {
          tagName: 'u-code-block',
          component: UCodeBlock,
          options: { attributes: ['code', 'language'] },
        },
        {
          tagName: 'u-json-tree',
          component: UJsonTree,
          options: {},
        },
        {
          tagName: 'u-key-value',
          component: UKeyValue,
          options: { attributes: ['label'] },
        },
        {
          tagName: 'u-stat',
          component: UStat,
          options: { attributes: ['label', 'value', 'trend', 'color'] },
        },
        {
          tagName: 'u-table',
          component: UTable,
          options: {},
        },
        {
          tagName: 'u-loading',
          component: ULoading,
          options: { attributes: ['size', 'text'] },
        },
        {
          tagName: 'u-empty',
          component: UEmpty,
          options: { attributes: ['icon', 'title', 'description', 'message'] },
        },
        {
          tagName: 'u-form',
          component: UForm,
          options: { emits: ['update:modelValue'] },
        },
      ]);
      componentsRegistered = true;
    }

    const cleanup = createVanillaPanel(container, api);
    
    return () => {
      cleanup?.();
      bridge.close();
    };
  },
};

export default plugin;
