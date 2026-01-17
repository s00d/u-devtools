---
to: <%= projectName %>/src/views/LayoutComponents.tsx
---
import { useState } from 'react';
import { useVueRef } from '../hooks/useVueRef';

export const LayoutComponents = () => {
  const [activeTab, setActiveTab] = useState('Tab 1');
  const [activeTabButton, setActiveTabButton] = useState('Button 1');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use useVueRef for complex props and events
  const tabsRef = useVueRef({
    items: ['Tab 1', 'Tab 2', 'Tab 3'],
    modelValue: activeTab,
    'onUpdate:modelValue': (val: string) => setActiveTab(val),
  });

  const tabButtonsRef = useVueRef({
    items: ['Button 1', 'Button 2', 'Button 3'],
    modelValue: activeTabButton,
    'onUpdate:modelValue': (val: string) => setActiveTabButton(val),
  });

  const modalRef = useVueRef({
    visible: isModalOpen,
    onClose: () => setIsModalOpen(false),
    title: 'Modal Title',
  });

  return (
    <div className="space-y-6">
      <u-card title="UTabs - Tab Navigation">
        <div className="p-4 space-y-4">
          <u-tabs ref={tabsRef} />
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-sm text-gray-400">Active tab: {activeTab}</p>
          </div>
        </div>
      </u-card>

      <u-card title="UTabButtons - Button Tabs">
        <div className="p-4 space-y-4">
          <u-tab-buttons ref={tabButtonsRef} />
          <div className="p-4 bg-gray-800 rounded">
            <p className="text-sm text-gray-400">Active button: {activeTabButton}</p>
          </div>
        </div>
      </u-card>

      <u-card title="UCard - Card Container">
        <div className="p-4 space-y-4">
          <u-card title="Card with Title" subtitle="This is a subtitle">
            <div className="p-4">
              <p className="text-sm text-gray-300">Card content goes here</p>
            </div>
          </u-card>
          <u-card>
            <div className="p-4">
              <p className="text-sm text-gray-300">Card without title</p>
            </div>
          </u-card>
        </div>
      </u-card>

      <u-card title="UModal - Modal Dialog">
        <div className="p-4 space-y-4">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Open Modal
          </button>
          <u-modal ref={modalRef}>
            <div className="p-4">
              <p className="text-sm text-gray-300 mb-4">This is modal content</p>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </u-modal>
        </div>
      </u-card>

      <u-card title="USplitter - Resizable Panes">
        <div className="p-4">
          <p className="text-sm text-gray-400 mb-4">
            USplitter requires named slots which are complex to implement with Web Components.
            This is a placeholder for the component.
          </p>
          <div className="h-64 border border-gray-700 rounded flex">
            <div className="w-1/3 bg-gray-800 p-4 border-r border-gray-700">
              <p className="text-sm text-gray-300">Left Pane</p>
            </div>
            <div className="flex-1 bg-gray-900 p-4">
              <p className="text-sm text-gray-300">Right Pane</p>
            </div>
          </div>
        </div>
      </u-card>
    </div>
  );
};

