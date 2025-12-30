---
to: <%= projectName %>/src/ui/astro-panel.ts
---
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ClientApi } from '@u-devtools/core';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

@customElement('astro-panel')
export class AstroPanel extends LitElement {
  // Получаем API через свойство (устанавливается в client.ts)
  @property({ attribute: false })
  api!: ClientApi;

  @state()
  private count = 0;

  @state()
  private serverData = '';

  // Отключаем Shadow DOM, чтобы использовать глобальные стили Tailwind
  protected createRenderRoot() {
    return this;
  }

  private increment() {
    this.count++;
  }

  private decrement() {
    this.count--;
  }

  private async callServer() {
    try {
      const res = await this.api.rpc.call<string>('<%= pluginKebab %>:hello');
      this.serverData = res;
      this.api.notify('Hello from Astro/Lit!', 'success');
    } catch (e) {
      this.api.notify('RPC call failed', 'error');
    }
  }

  render() {
    return html`
      <div class="p-6 text-gray-200">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 rounded bg-[#ff5d01] flex items-center justify-center text-white font-bold">
            As
          </div>
          <h1 class="text-2xl font-bold"><%= pluginName %></h1>
        </div>

        <div class="space-y-4">
          <!-- Interactive Counter -->
          <div class="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="font-bold text-[#ff5d01] mb-2">Interactive Counter</h3>
            <div class="flex gap-2 items-center">
              <button
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                @click=${this.decrement}
              >
                -
              </button>
              <span class="font-mono text-xl w-8 text-center">${this.count}</span>
              <button
                class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
                @click=${this.increment}
              >
                +
              </button>
            </div>
          </div>

          <!-- Server RPC -->
          <div class="p-4 bg-gray-800 rounded border border-gray-700">
            <h3 class="font-bold text-green-400 mb-2">Server RPC</h3>
            <button
              class="px-4 py-2 bg-[#ff5d01]/20 text-[#ff5d01] border border-[#ff5d01]/50 rounded hover:bg-[#ff5d01]/30 transition"
              @click=${this.callServer}
            >
              Call Node.js
            </button>
            
            ${this.serverData
              ? html`
                  <div class="mt-2 p-2 bg-black/30 rounded font-mono text-sm">
                    Server: ${this.serverData}
                  </div>
                `
              : ''}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'astro-panel': AstroPanel;
  }
}

