---
to: <%= projectName %>/src/views/forms.ts
---
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('forms-component')
export class Forms extends LitElement {
  private formSchema = {
    name: { label: 'Name', type: 'string' as const },
    email: { label: 'Email', type: 'string' as const },
    role: {
      label: 'Role',
      type: 'select' as const,
      options: [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
    },
    active: { label: 'Active', type: 'boolean' as const },
  };

  @state()
  private formData = {
    name: '',
    email: '',
    role: 'user',
    active: false,
  };

  private formElement: HTMLElement | null = null;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    // Set props immediately when element is connected to DOM
    // This happens before Vue component mounts (which uses requestAnimationFrame)
    this.formElement = this.querySelector('u-form') as HTMLElement;
    this.updateFormProps();
  }

  protected updated() {
    // Re-query elements in case they were re-rendered
    if (!this.formElement) {
      this.formElement = this.querySelector('u-form') as HTMLElement;
    }
    this.updateFormProps();
  }

  private updateFormProps() {
    if (this.formElement) {
      (this.formElement as any).props = {
        schema: this.formSchema,
        modelValue: this.formData,
        'onUpdate:modelValue': (val: any) => {
          this.formData = val;
          this.requestUpdate();
        },
      };
    }
  }


  private handleNameInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.formData = { ...this.formData, name: target.value };
    this.requestUpdate();
  };

  private handleEmailInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.formData = { ...this.formData, email: target.value };
    this.requestUpdate();
  };

  private handleRoleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    this.formData = { ...this.formData, role: target.value };
    this.requestUpdate();
  };

  private handleActiveChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.formData = { ...this.formData, active: target.checked };
    this.requestUpdate();
  };

  render() {
    return html`
      <div class="space-y-6">
        <u-card title="UForm - Form Component">
          <div class="p-4">
            <u-form></u-form>
            <div class="mt-4 p-4 bg-gray-800 rounded">
              <p class="text-sm text-gray-400 mb-2">Form Data:</p>
              <pre class="text-xs text-gray-300">${JSON.stringify(this.formData, null, 2)}</pre>
            </div>
          </div>
        </u-card>

        <u-card title="Form Example - Manual">
          <div class="p-4 space-y-4">
            <div>
              <label for="name-input" class="block text-sm text-gray-400 mb-2">Name</label>
              <input
                id="name-input"
                type="text"
                .value=${this.formData.name}
                @input=${this.handleNameInput}
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label for="email-input" class="block text-sm text-gray-400 mb-2">Email</label>
              <input
                id="email-input"
                type="email"
                .value=${this.formData.email}
                @input=${this.handleEmailInput}
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label for="role-select" class="block text-sm text-gray-400 mb-2">Role</label>
              <select
                id="role-select"
                .value=${this.formData.role}
                @change=${this.handleRoleChange}
                class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  .checked=${this.formData.active}
                  @change=${this.handleActiveChange}
                  class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500"
                />
                <span class="text-sm text-gray-400">Active</span>
              </label>
            </div>
          </div>
        </u-card>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'forms-component': Forms;
  }
}

