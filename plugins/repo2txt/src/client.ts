import type { PluginClientInstance, AppBridge, PluginSettingsSchema } from '@u-devtools/core';
import { createApp } from 'vue';
import { createToast } from '@u-devtools/overlay';
import { setupDevTools } from './context';
import type { repo2txtProtocol } from './types';
import repo2txtPanel from './ui/repo2txtPanel.vue';
import { getDefaultConfig } from './utils/default-config';

const defaultConfig = getDefaultConfig();

const plugin: PluginClientInstance = {
  name: 'repo2txt',
  icon: 'Cube',

  settings: {
    token_limit: {
      label: 'Token Limit',
      type: 'number',
      default: defaultConfig.token_limit || 128000,
      description: 'Maximum tokens for context usage warning',
    },
    max_file_size: {
      label: 'Max File Size (bytes)',
      type: 'number',
      default: defaultConfig.max_file_size || 1048576,
      description: 'Maximum file size to include in generation (1 MB = 1048576 bytes)',
    },
    output_template: {
      label: 'Output Template',
      type: 'string',
      default: defaultConfig.output_template || '## {{path}}\n\n```{{language}}\n{{content}}\n```\n\n---\n\n',
      description: 'Template for markdown generation. Use {{path}}, {{language}}, {{content}}',
    },
    ignored_names: {
      label: 'Ignored File Names',
      type: 'array',
      itemType: 'string',
      default: defaultConfig.ignored_names || [],
      description: 'File names to ignore (e.g., .DS_Store, Thumbs.db)',
    },
    ignored_folders: {
      label: 'Ignored Folder Names',
      type: 'array',
      itemType: 'string',
      default: defaultConfig.ignored_folders || [],
      description: 'Folder names to ignore (e.g., node_modules, .git)',
    },
    binary_extensions: {
      label: 'Binary Extensions',
      type: 'array',
      itemType: 'string',
      default: defaultConfig.binary_extensions || [],
      description: 'File extensions to treat as binary (e.g., png, jpg, exe)',
    },
  } as PluginSettingsSchema,

  renderMain(container: HTMLElement, api, { bridge }) {
    // Cast bridge to the required protocol
    const typedBridge = bridge as AppBridge<repo2txtProtocol>;

    // Initialize context (once!)
    setupDevTools({ api, bridge: typedBridge, toast: createToast() });

    const app = createApp(repo2txtPanel);
    app.mount(container);
    return () => {
      app.unmount();
      typedBridge.close();
    };
  },
};

export default plugin;
