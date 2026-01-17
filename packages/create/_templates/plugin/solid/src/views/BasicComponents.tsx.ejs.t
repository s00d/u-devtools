---
to: <%= projectName %>/src/views/BasicComponents.tsx
---
import { createSignal } from 'solid-js';
import { useVueRef } from '../hooks/useVueRef';

export const BasicComponents = () => {
  const [inputValue, setInputValue] = createSignal('');
  const [selectValue, setSelectValue] = createSignal('option1');

  const buttonRef = useVueRef({
    onClick: () => alert('Button clicked!'),
  });

  const inputRef = useVueRef(() => ({
    modelValue: inputValue(),
    'onUpdate:modelValue': (val: string) => setInputValue(val),
  }));

  const selectRef = useVueRef(() => ({
    modelValue: selectValue(),
    'onUpdate:modelValue': (val: string) => setSelectValue(val),
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 'option3' },
    ],
  }));

  return (
    <div class="space-y-6">
      <u-card title="UButton - Buttons">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-3">
            <u-button ref={buttonRef} label="Primary" variant="primary" icon="Star" />
            <u-button label="Secondary" variant="secondary" icon="Heart" />
            <u-button label="Ghost" variant="ghost" icon="ArrowPath" />
            <u-button label="Danger" variant="danger" icon="Trash" />
          </div>
          <div class="flex flex-wrap gap-3">
            <u-button label="Small" size="sm" variant="primary" />
            <u-button label="Medium" size="md" variant="primary" />
            <u-button label="Large" size="lg" variant="primary" />
          </div>
          <div class="flex flex-wrap gap-3">
            <u-button label="Disabled" variant="primary" disabled />
            <u-button label="With Icon" variant="primary" icon="Plus" />
          </div>
        </div>
      </u-card>

      <u-card title="UInput - Text Input">
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label for="basic-input" class="text-sm text-gray-400">Basic Input</label>
            <u-input id="basic-input" ref={inputRef} placeholder="Type something..." />
            <p class="text-xs text-gray-500">Value: {inputValue()}</p>
          </div>
          <div class="space-y-2">
            <label for="icon-input" class="text-sm text-gray-400">With Icon</label>
            <u-input id="icon-input" placeholder="Search..." icon="MagnifyingGlass" />
          </div>
          <div class="space-y-2">
            <span class="text-sm text-gray-400">Sizes</span>
            <u-input id="sm-input" placeholder="Small" size="sm" />
            <u-input id="md-input" placeholder="Medium" size="md" />
            <u-input id="lg-input" placeholder="Large" size="lg" />
          </div>
        </div>
      </u-card>

      <u-card title="USelect - Dropdown">
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label for="select-option" class="text-sm text-gray-400">Select Option</label>
            <u-select id="select-option" ref={selectRef} />
            <p class="text-xs text-gray-500">Selected: {selectValue()}</p>
          </div>
        </div>
      </u-card>

      <u-card title="UBadge - Status Badges">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-3">
            <u-badge label="Success" color="green" />
            <u-badge label="Error" color="red" />
            <u-badge label="Warning" color="yellow" />
            <u-badge label="Info" color="blue" />
            <u-badge label="Gray" color="gray" />
          </div>
          <div class="flex flex-wrap gap-3">
            <u-badge label="Filled" variant="filled" color="green" />
            <u-badge label="Outlined" variant="outlined" color="blue" />
          </div>
        </div>
      </u-card>

      <u-card title="UIcon - Icons">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Home" />
              <span class="text-xs text-gray-500">Home</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Cog" />
              <span class="text-xs text-gray-500">Cog</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Star" solid />
              <span class="text-xs text-gray-500">Star (solid)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Heart" />
              <span class="text-xs text-gray-500">Heart</span>
            </div>
          </div>
        </div>
      </u-card>
    </div>
  );
};

