---
to: <%= projectName %>/src/views/BasicComponents.tsx
---
import { useState } from 'react';
import { useVueRef } from '../hooks/useVueRef';

export const BasicComponents = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');

  // Use useVueRef for complex props and events
  const buttonRef = useVueRef({
    onClick: () => alert('Button clicked!'),
  });

  const inputRef = useVueRef({
    modelValue: inputValue,
    'onUpdate:modelValue': (val: string) => setInputValue(val),
  });

  const selectRef = useVueRef({
    modelValue: selectValue,
    'onUpdate:modelValue': (val: string) => setSelectValue(val),
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  });

  return (
    <div className="space-y-6">
      <u-card title="UButton - Buttons">
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <u-button ref={buttonRef} label="Primary" variant="primary" icon="Star" />
            <u-button label="Secondary" variant="secondary" icon="Heart" />
            <u-button label="Ghost" variant="ghost" icon="ArrowPath" />
            <u-button label="Danger" variant="danger" icon="Trash" />
          </div>
          <div className="flex flex-wrap gap-3">
            <u-button label="Small" size="sm" variant="primary" />
            <u-button label="Medium" size="md" variant="primary" />
            <u-button label="Large" size="lg" variant="primary" />
          </div>
          <div className="flex flex-wrap gap-3">
            <u-button label="Disabled" variant="primary" disabled />
            <u-button label="With Icon" variant="primary" icon="Plus" />
          </div>
        </div>
      </u-card>

      <u-card title="UInput - Text Input">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="basic-input" className="text-sm text-gray-400">Basic Input</label>
            <u-input id="basic-input" ref={inputRef} placeholder="Type something..." />
            <p className="text-xs text-gray-500">Value: {inputValue}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="icon-input" className="text-sm text-gray-400">With Icon</label>
            <u-input id="icon-input" placeholder="Search..." icon="MagnifyingGlass" />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-400">Sizes</span>
            <u-input id="sm-input" placeholder="Small" size="sm" />
            <u-input id="md-input" placeholder="Medium" size="md" />
            <u-input id="lg-input" placeholder="Large" size="lg" />
          </div>
        </div>
      </u-card>

      <u-card title="USelect - Dropdown">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="select-option" className="text-sm text-gray-400">Select Option</label>
            <u-select id="select-option" ref={selectRef} />
            <p className="text-xs text-gray-500">Selected: {selectValue}</p>
          </div>
        </div>
      </u-card>

      <u-card title="UBadge - Status Badges">
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <u-badge label="Success" color="green" />
            <u-badge label="Error" color="red" />
            <u-badge label="Warning" color="yellow" />
            <u-badge label="Info" color="blue" />
            <u-badge label="Gray" color="gray" />
          </div>
          <div className="flex flex-wrap gap-3">
            <u-badge label="Filled" variant="filled" color="green" />
            <u-badge label="Outlined" variant="outlined" color="blue" />
          </div>
        </div>
      </u-card>

      <u-card title="UIcon - Icons">
        <div className="p-4 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col items-center gap-2">
              <u-icon name="Home" />
              <span className="text-xs text-gray-500">Home</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <u-icon name="Cog" />
              <span className="text-xs text-gray-500">Cog</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <u-icon name="Star" solid />
              <span className="text-xs text-gray-500">Star (solid)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <u-icon name="Heart" />
              <span className="text-xs text-gray-500">Heart</span>
            </div>
          </div>
        </div>
      </u-card>
    </div>
  );
};

