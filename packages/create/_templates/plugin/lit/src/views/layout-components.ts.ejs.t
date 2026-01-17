---
to: <%= projectName %>/src/views/layout-components.ts
---
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('layout-components')
export class LayoutComponents extends LitElement {
  @state()
  private activeTab = 'Tab 1';

  @state()
  private activeTabButton = 'Button 1';

  @state()
  private isModalOpen = false;

  private tabsElement: HTMLElement | null = null;
  private tabButtonsElement: HTMLElement | null = null;
  private modalElement: HTMLElement | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set props immediately when element is connected to DOM
    // This happens before Vue component mounts (which uses requestAnimationFrame)
    this.tabsElement = this.querySelector('u-tabs') as HTMLElement;
    this.tabButtonsElement = this.querySelector('u-tab-buttons') as HTMLElement;
    this.modalElement = this.querySelector('u-modal') as HTMLElement;
    this.updateTabsProps();
    this.updateTabButtonsProps();
    this.updateModalProps();
  }

  protected updated() {
    // Re-query elements in case they were re-rendered
    if (!this.tabsElement) {
      this.tabsElement = this.querySelector('u-tabs') as HTMLElement;
    }
    if (!this.tabButtonsElement) {
      this.tabButtonsElement = this.querySelector('u-tab-buttons') as HTMLElement;
    }
    if (!this.modalElement) {
      this.modalElement = this.querySelector('u-modal') as HTMLElement;
    }
    this.updateTabsProps();
    this.updateTabButtonsProps();
    this.updateModalProps();
  }

  private updateTabsProps() {
    if (this.tabsElement) {
      (this.tabsElement as any).props = {
        items: ['Tab 1', 'Tab 2', 'Tab 3'],
        modelValue: this.activeTab,
        'onUpdate:modelValue': (val: string) => {
          this.activeTab = val;
          this.requestUpdate();
        },
      };
    }
  }

  private updateTabButtonsProps() {
    if (this.tabButtonsElement) {
      (this.tabButtonsElement as any).props = {
        items: ['Button 1', 'Button 2', 'Button 3'],
        modelValue: this.activeTabButton,
        'onUpdate:modelValue': (val: string) => {
          this.activeTabButton = val;
          this.requestUpdate();
        },
      };
    }
  }

  private updateModalProps() {
    if (this.modalElement) {
      (this.modalElement as any).props = {
        visible: this.isModalOpen,
        onClose: () => {
          this.isModalOpen = false;
          this.requestUpdate();
        },
        title: 'Modal Title',
      };
    }
  }

  private openModal = () => {
    this.isModalOpen = true;
    this.requestUpdate();
  };

  private closeModal = () => {
    this.isModalOpen = false;
    this.requestUpdate();
  };

  render() {
    return html`
      <div class="space-y-6">
        <u-card title="UTabs - Tab Navigation">
          <div class="p-4 space-y-4">
            <u-tabs></u-tabs>
            <div class="p-4 bg-gray-800 rounded">
              <p class="text-sm text-gray-400">Active tab: ${this.activeTab}</p>
            </div>
          </div>
        </u-card>

        <u-card title="UTabButtons - Button Tabs">
          <div class="p-4 space-y-4">
            <u-tab-buttons></u-tab-buttons>
            <div class="p-4 bg-gray-800 rounded">
              <p class="text-sm text-gray-400">Active button: ${this.activeTabButton}</p>
            </div>
          </div>
        </u-card>

        <u-card title="UCard - Card Container">
          <div class="p-4 space-y-4">
            <u-card title="Card with Title" subtitle="This is a subtitle">
              <div class="p-4">
                <p class="text-sm text-gray-300">Card content goes here</p>
              </div>
            </u-card>
            <u-card>
              <div class="p-4">
                <p class="text-sm text-gray-300">Card without title</p>
              </div>
            </u-card>
          </div>
        </u-card>

        <u-card title="UModal - Modal Dialog">
          <div class="p-4 space-y-4">
            <button
              type="button"
              @click=${this.openModal}
              class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Open Modal
            </button>
            <u-modal>
              <div class="p-4">
                <p class="text-sm text-gray-300 mb-4">This is modal content</p>
                <button
                  type="button"
                  @click=${this.closeModal}
                  class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </u-modal>
          </div>
        </u-card>

        <u-card title="USplitter - Resizable Panes">
          <div class="p-4">
            <p class="text-sm text-gray-400 mb-4">
              USplitter requires named slots which are complex to implement with Web Components.
              This is a placeholder for the component.
            </p>
            <div class="h-64 border border-gray-700 rounded flex">
              <div class="w-1/3 bg-gray-800 p-4 border-r border-gray-700">
                <p class="text-sm text-gray-300">Left Pane</p>
              </div>
              <div class="flex-1 bg-gray-900 p-4">
                <p class="text-sm text-gray-300">Right Pane</p>
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
    'layout-components': LayoutComponents;
  }
}

