---
to: <%= projectName %>/src/views/BasicComponents.ts
---
export function renderBasicComponents(container: HTMLElement) {
  let inputValue = '';
  let selectValue = 'option1';

  container.innerHTML = `
    <div class="space-y-6">
      <!-- UButton Examples -->
      <u-card title="UButton - Buttons">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-3">
            <u-button id="btn-primary" label="Primary" variant="primary" icon="Star"></u-button>
            <u-button label="Secondary" variant="secondary" icon="Heart"></u-button>
            <u-button label="Ghost" variant="ghost" icon="ArrowPath"></u-button>
            <u-button label="Danger" variant="danger" icon="Trash"></u-button>
          </div>
          <div class="flex flex-wrap gap-3">
            <u-button label="Small" size="sm" variant="primary"></u-button>
            <u-button label="Medium" size="md" variant="primary"></u-button>
            <u-button label="Large" size="lg" variant="primary"></u-button>
          </div>
          <div class="flex flex-wrap gap-3">
            <u-button label="Disabled" variant="primary" disabled></u-button>
            <u-button label="With Icon" variant="primary" icon="Plus"></u-button>
          </div>
        </div>
      </u-card>

      <!-- UInput Examples -->
      <u-card title="UInput - Text Input">
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label for="basic-input" class="text-sm text-gray-400">Basic Input</label>
            <u-input id="basic-input" placeholder="Type something..."></u-input>
            <p id="input-value-display" class="text-xs text-gray-500">Value: </p>
          </div>
          <div class="space-y-2">
            <label for="icon-input" class="text-sm text-gray-400">With Icon</label>
            <u-input id="icon-input" placeholder="Search..." icon="MagnifyingGlass"></u-input>
          </div>
          <div class="space-y-2">
            <span class="text-sm text-gray-400">Sizes</span>
            <u-input id="sm-input" placeholder="Small" size="sm"></u-input>
            <u-input id="md-input" placeholder="Medium" size="md"></u-input>
            <u-input id="lg-input" placeholder="Large" size="lg"></u-input>
          </div>
        </div>
      </u-card>

      <!-- USelect Examples -->
      <u-card title="USelect - Dropdown">
        <div class="p-4 space-y-4">
          <div class="space-y-2">
            <label for="select-option" class="text-sm text-gray-400">Select Option</label>
            <u-select id="select-option"></u-select>
            <p id="select-value-display" class="text-xs text-gray-500">Selected: option1</p>
          </div>
        </div>
      </u-card>

      <!-- UBadge Examples -->
      <u-card title="UBadge - Status Badges">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-3">
            <u-badge label="Success" color="green"></u-badge>
            <u-badge label="Error" color="red"></u-badge>
            <u-badge label="Warning" color="yellow"></u-badge>
            <u-badge label="Info" color="blue"></u-badge>
            <u-badge label="Gray" color="gray"></u-badge>
          </div>
          <div class="flex flex-wrap gap-3">
            <u-badge label="Filled" variant="filled" color="green"></u-badge>
            <u-badge label="Outlined" variant="outlined" color="blue"></u-badge>
          </div>
        </div>
      </u-card>

      <!-- UIcon Examples -->
      <u-card title="UIcon - Icons">
        <div class="p-4 space-y-4">
          <div class="flex flex-wrap gap-4">
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Home"></u-icon>
              <span class="text-xs text-gray-500">Home</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Cog"></u-icon>
              <span class="text-xs text-gray-500">Cog</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Star" solid></u-icon>
              <span class="text-xs text-gray-500">Star (solid)</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <u-icon name="Heart"></u-icon>
              <span class="text-xs text-gray-500">Heart</span>
            </div>
          </div>
        </div>
      </u-card>
    </div>
  `;

  // Setup input binding
  const inputEl = container.querySelector('#basic-input') as HTMLElement;
  const inputValueDisplay = container.querySelector('#input-value-display') as HTMLElement;

  if (inputEl) {
    (inputEl as any).props = {
      modelValue: inputValue,
      'onUpdate:modelValue': (val: string) => {
        inputValue = val;
        inputValueDisplay.textContent = `Value: ${inputValue}`;
        (inputEl as any).props = { ...(inputEl as any).props, modelValue: inputValue };
      },
    };
  }

  // Setup select binding
  const selectEl = container.querySelector('#select-option') as HTMLElement;
  const selectValueDisplay = container.querySelector('#select-value-display') as HTMLElement;

  if (selectEl) {
    (selectEl as any).props = {
      modelValue: selectValue,
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
      ],
      'onUpdate:modelValue': (val: string) => {
        selectValue = val;
        selectValueDisplay.textContent = `Selected: ${selectValue}`;
        (selectEl as any).props = { ...(selectEl as any).props, modelValue: selectValue };
      },
    };
  }

  // Setup button click (only listen to CustomEvent from Vue, not native DOM events)
  const btnPrimary = container.querySelector('#btn-primary');
  if (btnPrimary) {
    btnPrimary.addEventListener('click', (e: Event) => {
      // Only handle CustomEvent from Vue emit, ignore native DOM events
      if (e instanceof CustomEvent && (e as any)._isVueEvent) {
        alert('Button clicked!');
      }
    });
  }
}

