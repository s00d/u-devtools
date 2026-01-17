---
to: <%= projectName %>/src/client.tsx
---
import type { PluginClientInstance, ClientApi, AppBridge } from '@u-devtools/core';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { defineVueElements } from '@u-devtools/kit/web-components';
import { useVueRef } from './hooks/useVueRef';
import { useApi, setupDevTools } from './context';
import { createToast } from '@u-devtools/overlay';
import type { <%= pluginName.replace(/\s+/g, '') %>Protocol } from './types';
import {
  UButton,
  UCard,
  UBadge,
  UInput,
  USelect,
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
import { BasicComponents } from './views/BasicComponents';
import { LayoutComponents } from './views/LayoutComponents';
import { DataDisplay } from './views/DataDisplay';
import { StateComponents } from './views/StateComponents';
import { Forms } from './views/Forms';

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

const TAB_ITEMS = ['Basic', 'Layout', 'Data', 'State', 'Forms'];

// React Component using Web Components
const ReactPanel = () => {
  const api = useApi();
  const [activeTab, setActiveTab] = useState('Basic');

  // Use useVueRef for complex props and events
  const tabsRef = useVueRef({
    items: TAB_ITEMS,
    modelValue: activeTab,
    'onUpdate:modelValue': (val: string) => setActiveTab(val),
    maxVisible: 5,
  });

  const resetBtnRef = useVueRef({
    onClick: () => {
      setActiveTab('Basic');
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'Basic':
        return <BasicComponents />;
      case 'Layout':
        return <LayoutComponents />;
      case 'Data':
        return <DataDisplay />;
      case 'State':
        return <StateComponents />;
      case 'Forms':
        return <Forms />;
      default:
        return <BasicComponents />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-200">
      {/* Toolbar */}
      <div className="border-b border-gray-800 bg-gray-800">
        <div className="p-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-white flex items-center gap-2">
              <u-icon name="CodeBracket" className="w-5 h-5" />
              <%= pluginName %>
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-4 w-px bg-gray-700"></div>
              <u-tabs ref={tabsRef} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <u-button
              ref={resetBtnRef}
              label="Reset"
              variant="ghost"
              size="sm"
              icon="ArrowPath"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">{renderContent()}</div>
    </div>
  );
};

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'CodeBracket',

  renderMain(container, api, { bridge }) {
    // Cast bridge to required protocol type
    const typedBridge = bridge as AppBridge<<%= pluginName.replace(/\s+/g, '') %>Protocol>;
    // Initialize context (once!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });
    
    const root = createRoot(container);
    root.render(<ReactPanel />);

    return () => {
      root.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;

