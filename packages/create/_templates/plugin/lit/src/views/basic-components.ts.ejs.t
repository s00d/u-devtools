---
to: <%= projectName %>/src/views/basic-components.ts
---
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('basic-components')
export class BasicComponents extends LitElement {
  @state()
  private inputValue = '';

  @state()
  private selectValue = 'option1';

  private buttonElement: HTMLElement | null = null;
  private inputElement: HTMLElement | null = null;
  private selectElement: HTMLElement | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set props immediately when element is connected to DOM
    // This happens before Vue component mounts (which uses requestAnimationFrame)
    this.buttonElement = this.querySelector('u-button') as HTMLElement;
    this.inputElement = this.querySelector('#basic-input') as HTMLElement;
    this.selectElement = this.querySelector('#select-option') as HTMLElement;
    this.updateButtonProps();
    this.updateInputProps();
    this.updateSelectProps();
  }

  protected updated() {
    // Re-query elements in case they were re-rendered
    if (!this.inputElement) {
      this.inputElement = this.querySelector('#basic-input') as HTMLElement;
    }
    if (!this.selectElement) {
      this.selectElement = this.querySelector('#select-option') as HTMLElement;
    }
    this.updateInputProps();
    this.updateSelectProps();
  }

  private updateButtonProps() {
    if (this.buttonElement) {
      (this.buttonElement as any).props = {
        onClick: () => alert('Button clicked!'),
      };
    }
  }

  private updateInputProps() {
    if (this.inputElement) {
      (this.inputElement as any).props = {
        modelValue: this.inputValue,
        'onUpdate:modelValue': (val: string) => {
          this.inputValue = val;
          this.requestUpdate();
        },
      };
    }
  }

  private updateSelectProps() {
    if (this.selectElement) {
      (this.selectElement as any).props = {
        modelValue: this.selectValue,
        'onUpdate:modelValue': (val: string) => {
          this.selectValue = val;
          this.requestUpdate();
        },
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ],
      };
    }
  }


  render() {
    return html`
      <div class="space-y-6">
        <u-card title="UButton - Buttons">
          <div class="p-4 space-y-4">
            <div class="flex flex-wrap gap-3">
              <u-button label="Primary" variant="primary" icon="Star"></u-button>
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
              <u-input id="basic-input" placeholder="Type something..."></u-input>
              <p class="text-xs text-gray-500">Value: ${this.inputValue}</p>
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
              <u-select id="select-option"></u-select>
              <p class="text-xs text-gray-500">Selected: ${this.selectValue}</p>
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'basic-components': BasicComponents;
  }
}

