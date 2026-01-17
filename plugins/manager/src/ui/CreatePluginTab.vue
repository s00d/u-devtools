<script setup lang="ts">
import { UButton } from '@u-devtools/ui';
import { useApi } from '../context';

const api = useApi();

// Plugin generator
const handleCreatePlugin = async () => {
  const projectName = await api.dialog.prompt({
    title: 'Create Plugin',
    message: 'Enter project folder name:',
    defaultValue: 'my-devtools-plugin',
  });

  if (!projectName) return;

  const pluginName = await api.dialog.prompt({
    title: 'Create Plugin',
    message: 'Enter plugin display name:',
    defaultValue: 'My Plugin',
  });

  if (!pluginName) return;

  const packageName = await api.dialog.prompt({
    title: 'Create Plugin',
    message: 'Enter package name:',
    defaultValue: `@u-devtools/plugin-${projectName.replace(/^my-devtools-plugin-?/, '')}`,
  });

  if (!packageName) return;

  const description = await api.dialog.prompt({
    title: 'Create Plugin',
    message: 'Enter description:',
    defaultValue: 'A plugin for Universal DevTools',
  });

  if (!description) return;

  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>('manager:scaffold', {
      projectName,
      pluginName,
      packageName,
      description,
      template: 'vue',
      features: ['settings', 'commands', 'filesystem', 'app-bridge'],
    });

    if (res.success) {
      api.notify('Plugin scaffold created successfully!', 'success');
    } else {
      api.notify(`Failed to create plugin: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    api.notify(`Failed to create plugin: ${message}`, 'error');
  }
};

// Add local plugin
const handleAddLocalPlugin = async () => {
  const relativePath = await api.dialog.prompt({
    title: 'Add Local Plugin',
    message: 'Enter relative path to plugin (e.g., ./plugins/my-plugin):',
    defaultValue: './plugins/my-plugin',
  });

  if (!relativePath) return;

  const importName = await api.dialog.prompt({
    title: 'Add Local Plugin',
    message: 'Enter import name (optional):',
    defaultValue: '',
  });

  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>('manager:addLocal', {
      relativePath,
      importName: importName || undefined,
    });

    if (res.success) {
      api.notify('Local plugin added successfully!', 'success');
      emit('refresh');
    } else {
      api.notify(`Failed to add local plugin: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    api.notify(`Failed to add local plugin: ${message}`, 'error');
  }
};

const emit = defineEmits<{
  refresh: [];
}>();
</script>

<template>
  <div class="space-y-4">
    <div class="border border-white/10 rounded-xl p-6 bg-zinc-900">
      <h3 class="text-lg font-bold text-white mb-4">Create New Plugin</h3>
      <p class="text-zinc-400 mb-4">
        Generate a new plugin scaffold using the Universal DevTools plugin generator.
      </p>
      <UButton variant="primary" icon="Plus" @click="handleCreatePlugin">
        Generate Plugin
      </UButton>
    </div>

    <div class="border border-white/10 rounded-xl p-6 bg-zinc-900">
      <h3 class="text-lg font-bold text-white mb-4">Add Local Plugin</h3>
      <p class="text-zinc-400 mb-4">
        Add a local plugin from your project directory.
      </p>
      <UButton variant="secondary" icon="Folder" @click="handleAddLocalPlugin">
        Add Local Plugin
      </UButton>
    </div>
  </div>
</template>

