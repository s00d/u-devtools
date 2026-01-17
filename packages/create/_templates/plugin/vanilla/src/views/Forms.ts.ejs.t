---
to: <%= projectName %>/src/views/Forms.ts
---
export function renderForms(container: HTMLElement) {
  const formSchema = {
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

  let formData = {
    name: '',
    email: '',
    role: 'user',
    active: false,
  };

  container.innerHTML = `
    <div class="space-y-6">
      <!-- UForm Example -->
      <u-card title="UForm - Form Component">
        <div class="p-4">
          <u-form id="form-example"></u-form>
          <div class="mt-4 p-4 bg-gray-800 rounded">
            <p class="text-sm text-gray-400 mb-2">Form Data:</p>
            <pre id="form-data-display" class="text-xs text-gray-300">${JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      </u-card>

      <!-- Manual Form Example -->
      <u-card title="Form Example - Manual">
        <div class="p-4 space-y-4">
          <div>
            <label for="name-input" class="block text-sm text-gray-400 mb-2">Name</label>
            <input
              id="name-input"
              type="text"
              value="${formData.name}"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label for="email-input" class="block text-sm text-gray-400 mb-2">Email</label>
            <input
              id="email-input"
              type="email"
              value="${formData.email}"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label for="role-select" class="block text-sm text-gray-400 mb-2">Role</label>
            <select
              id="role-select"
              class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label class="flex items-center gap-2">
              <input
                id="active-checkbox"
                type="checkbox"
                ${formData.active ? 'checked' : ''}
                class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500"
              />
              <span class="text-sm text-gray-400">Active</span>
            </label>
          </div>
        </div>
      </u-card>
    </div>
  `;

  // Setup form
  const formEl = container.querySelector('#form-example') as HTMLElement;
  const formDataDisplay = container.querySelector('#form-data-display') as HTMLElement;

  if (formEl) {
    (formEl as any).props = {
      schema: formSchema,
      modelValue: formData,
      'onUpdate:modelValue': (val: any) => {
        formData = val;
        formDataDisplay.textContent = JSON.stringify(formData, null, 2);
        (formEl as any).props = { ...(formEl as any).props, modelValue: formData };
      },
    };
  }

  // Setup manual form inputs
  const nameInput = container.querySelector('#name-input') as HTMLInputElement;
  const emailInput = container.querySelector('#email-input') as HTMLInputElement;
  const roleSelect = container.querySelector('#role-select') as HTMLSelectElement;
  const activeCheckbox = container.querySelector('#active-checkbox') as HTMLInputElement;

  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      formData.name = (e.target as HTMLInputElement).value;
      formDataDisplay.textContent = JSON.stringify(formData, null, 2);
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      formData.email = (e.target as HTMLInputElement).value;
      formDataDisplay.textContent = JSON.stringify(formData, null, 2);
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener('change', (e) => {
      formData.role = (e.target as HTMLSelectElement).value;
      formDataDisplay.textContent = JSON.stringify(formData, null, 2);
    });
  }

  if (activeCheckbox) {
    activeCheckbox.addEventListener('change', (e) => {
      formData.active = (e.target as HTMLInputElement).checked;
      formDataDisplay.textContent = JSON.stringify(formData, null, 2);
    });
  }
}

