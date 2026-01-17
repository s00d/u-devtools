---
to: <%= projectName %>/src/views/Forms.tsx
---
import { useState } from 'react';
import { useVueRef } from '../hooks/useVueRef';

const formSchema = {
  name: { label: 'Name', type: 'string' as const },
  email: { label: 'Email', type: 'string' as const },
  role: { label: 'Role', type: 'select' as const, options: [{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }] },
  active: { label: 'Active', type: 'boolean' as const },
};

export const Forms = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    active: false,
  });

  // Use the useVueRef hook for complex props and events
  const formRef = useVueRef({
    schema: formSchema,
    modelValue: formData,
    'onUpdate:modelValue': (val: any) => setFormData(val),
  });

  return (
    <div className="space-y-6">
      <u-card title="UForm - Form Component">
        <div className="p-4">
          <u-form ref={formRef} />
          <div className="mt-4 p-4 bg-gray-800 rounded">
            <p className="text-sm text-gray-400 mb-2">Form Data:</p>
            <pre className="text-xs text-gray-300">{JSON.stringify(formData, null, 2)}</pre>
          </div>
        </div>
      </u-card>

      <u-card title="Form Example - Manual">
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="name-input" className="block text-sm text-gray-400 mb-2">Name</label>
            <input
              id="name-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="Enter name"
            />
          </div>
          <div>
            <label htmlFor="email-input" className="block text-sm text-gray-400 mb-2">Email</label>
            <input
              id="email-input"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              placeholder="Enter email"
            />
          </div>
          <div>
            <label htmlFor="role-select" className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              id="role-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500"
              />
              <span className="text-sm text-gray-400">Active</span>
            </label>
          </div>
        </div>
      </u-card>
    </div>
  );
};

