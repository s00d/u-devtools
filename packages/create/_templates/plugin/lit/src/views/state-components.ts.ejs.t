---
to: <%= projectName %>/src/views/state-components.ts
---
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('state-components')
export class StateComponents extends LitElement {
  @state()
  private isLoading = false;

  protected createRenderRoot() {
    return this;
  }

  private handleLoad = () => {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
      this.requestUpdate();
    }, 2000);
    this.requestUpdate();
  };

  render() {
    return html`
      <div class="space-y-6">
        <u-card title="ULoading - Loading States">
          <div class="p-4 space-y-4">
            <div class="space-y-2">
              <span class="text-sm text-gray-400">Basic Loading</span>
              <u-loading></u-loading>
            </div>
            <div class="space-y-2">
              <span class="text-sm text-gray-400">With Text</span>
              <u-loading text="Loading data..."></u-loading>
            </div>
            <div class="space-y-2">
              <span class="text-sm text-gray-400">Interactive Example</span>
              <button
                type="button"
                @click=${this.handleLoad}
                ?disabled=${this.isLoading}
                class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                ${this.isLoading ? 'Loading...' : 'Start Loading'}
              </button>
              ${this.isLoading
                ? html`
                    <div class="mt-4">
                      <u-loading text="Processing..."></u-loading>
                    </div>
                  `
                : ''}
            </div>
          </div>
        </u-card>

        <u-card title="UEmpty - Empty States">
          <div class="p-4 space-y-4">
            <u-empty icon="Inbox" title="No items" description="There are no items to display"></u-empty>
            <u-empty
              icon="MagnifyingGlass"
              title="No results"
              description="Try adjusting your search criteria"
            ></u-empty>
            <u-empty icon="Folder" title="Empty folder" description="This folder is empty"></u-empty>
          </div>
        </u-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'state-components': StateComponents;
  }
}

