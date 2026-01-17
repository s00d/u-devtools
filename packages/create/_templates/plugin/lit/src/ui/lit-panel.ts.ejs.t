---
to: <%= projectName %>/src/ui/lit-panel.ts
---
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { useApi } from '../context';
import '../views/basic-components';
import '../views/layout-components';
import '../views/data-display';
import '../views/state-components';
import '../views/forms';

const TAB_ITEMS = ['Basic', 'Layout', 'Data', 'State', 'Forms'];

@customElement('lit-panel')
export class LitPanel extends LitElement {
  private get api() {
    return useApi();
  }

  @state()
  private activeTab = 'Basic';

  private tabsElement: HTMLElement | null = null;
  private resetButtonElement: HTMLElement | null = null;

  // Отключаем Shadow DOM, чтобы использовать глобальные стили Tailwind
  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set props immediately when element is connected to DOM
    // This happens before Vue component mounts (which uses requestAnimationFrame)
    this.tabsElement = this.querySelector('u-tabs') as HTMLElement;
    this.resetButtonElement = this.querySelector('u-button') as HTMLElement;
    this.updateTabsProps();
    this.updateResetButtonProps();
  }

  protected updated() {
    // Update props when activeTab changes
    if (!this.tabsElement) {
      this.tabsElement = this.querySelector('u-tabs') as HTMLElement;
    }
    if (!this.resetButtonElement) {
      this.resetButtonElement = this.querySelector('u-button') as HTMLElement;
    }
    this.updateTabsProps();
    this.updateResetButtonProps();
  }

  private updateTabsProps() {
    if (this.tabsElement) {
      (this.tabsElement as any).props = {
        items: TAB_ITEMS,
        modelValue: this.activeTab,
        maxVisible: 5,
        'onUpdate:modelValue': (val: string) => {
          this.activeTab = val;
          this.requestUpdate();
        },
      };
    }
  }

  private updateResetButtonProps() {
    if (this.resetButtonElement) {
      (this.resetButtonElement as any).props = {
        onClick: () => {
          this.activeTab = 'Basic';
          this.requestUpdate();
        },
      };
    }
  }

  private renderContent() {
    switch (this.activeTab) {
      case 'Basic':
        return html`<basic-components></basic-components>`;
      case 'Layout':
        return html`<layout-components></layout-components>`;
      case 'Data':
        return html`<data-display></data-display>`;
      case 'State':
        return html`<state-components></state-components>`;
      case 'Forms':
        return html`<forms-component></forms-component>`;
      default:
        return html`<basic-components></basic-components>`;
    }
  }

  render() {
    return html`
      <div class="h-full flex flex-col bg-gray-900 text-gray-200">
        <!-- Toolbar -->
        <div class="border-b border-gray-800 bg-gray-800">
          <div class="p-3 flex justify-between items-center">
            <div class="flex items-center gap-4">
              <h2 class="font-bold text-white flex items-center gap-2">
                <u-icon name="CodeBracket" class="w-5 h-5"></u-icon>
                <%= pluginName %>
              </h2>
              <div class="flex items-center gap-2">
                <div class="h-4 w-px bg-gray-700"></div>
                <u-tabs></u-tabs>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <u-button
                label="Reset"
                variant="ghost"
                size="sm"
                icon="ArrowPath"
              ></u-button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto p-6">
          ${this.renderContent()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lit-panel': LitPanel;
  }
}
