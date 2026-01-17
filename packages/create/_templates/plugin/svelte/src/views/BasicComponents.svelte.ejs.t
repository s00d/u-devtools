---
to: <%= projectName %>/src/views/BasicComponents.svelte
---
<script lang="ts">
  import { useVueProps } from '../actions/useVueProps';

  let inputValue = $state('');
  let selectValue = $state('option1');

  let buttonElement: HTMLElement | null = $state(null);
  let inputElement: HTMLElement | null = $state(null);
  let selectElement: HTMLElement | null = $state(null);

  // Setup button props
  $effect(() => {
    if (buttonElement) {
      (buttonElement as any).props = {
        onClick: () => alert('Button clicked!'),
      };
    }
  });

  // Setup input props
  $effect(() => {
    if (inputElement) {
      (inputElement as any).props = {
        modelValue: inputValue,
        'onUpdate:modelValue': (val: string) => {
          inputValue = val;
        },
      };
    }
  });

  // Setup select props
  $effect(() => {
    if (selectElement) {
      (selectElement as any).props = {
        modelValue: selectValue,
        'onUpdate:modelValue': (val: string) => {
          selectValue = val;
        },
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      };
    }
  });
</script>

<div class="space-y-6">
  <u-card title="UButton - Buttons">
    <div class="p-4 space-y-4">
      <div class="flex flex-wrap gap-3">
        <u-button bind:this={buttonElement} label="Primary" variant="primary" icon="Star"></u-button>
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

  <u-card title="UInput - Text Input">
    <div class="p-4 space-y-4">
      <div class="space-y-2">
        <label for="basic-input" class="text-sm text-gray-400">Basic Input</label>
        <u-input id="basic-input" bind:this={inputElement} placeholder="Type something..."></u-input>
        <p class="text-xs text-gray-500">Value: {inputValue}</p>
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

  <u-card title="USelect - Dropdown">
    <div class="p-4 space-y-4">
      <div class="space-y-2">
        <label for="select-option" class="text-sm text-gray-400">Select Option</label>
        <u-select id="select-option" bind:this={selectElement}></u-select>
        <p class="text-xs text-gray-500">Selected: {selectValue}</p>
      </div>
    </div>
  </u-card>

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

