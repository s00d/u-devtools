import type { PluginClientInstance } from '@u-devtools/core';
import { createApp } from 'vue';
import I18nPanel from './ui/I18nPanel.vue';
import I18nSettings from './ui/I18nSettings.vue';

const refreshSignal = { value: () => {} };

const plugin: PluginClientInstance = {
  name: 'i18n',
  icon: 'Language',

  commands: [
    {
      id: 'i18n.refresh',
      label: 'Refresh Translations',
      icon: 'ArrowPath',
      action: () => {
        refreshSignal.value();
      },
    },
  ],

  settings: {
    itemsPerPage: {
      label: 'Items Per Page',
      type: 'number',
      default: 30,
    },
    // Translation settings are handled by I18nSettings.vue component
    // which conditionally shows fields based on selected driver
    translationDriver: {
      label: 'Translation Service',
      type: 'select',
      default: 'disabled',
      options: [
        { label: 'Disabled', value: 'disabled' },
        { label: 'OpenAI', value: 'openai' },
        { label: 'Google', value: 'google' },
        { label: 'Google Free', value: 'google-free' },
        { label: 'DeepL', value: 'deepl' },
        { label: 'DeepSeek', value: 'deepseek' },
        { label: 'Yandex', value: 'yandex' },
        { label: 'Yandex Cloud', value: 'yandex-cloud' },
      ],
    },
    translationApiToken: {
      label: 'API Token',
      type: 'string',
      default: '',
    },
    translationFolderId: {
      label: 'Yandex Cloud Folder ID',
      type: 'string',
      default: '',
    },
    translationFormality: {
      label: 'DeepL Formality',
      type: 'select',
      default: 'default',
      options: [
        { label: 'Neutral (Default)', value: 'default' },
        { label: 'Formal Tone', value: 'more' },
        { label: 'Casual Tone', value: 'less' },
      ],
    },
    translationModel: {
      label: 'AI Model',
      type: 'select',
      default: 'gpt-3.5-turbo',
      options: [
        { label: 'gpt-4o', value: 'gpt-4o' },
        { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
        { label: 'gpt-4-turbo', value: 'gpt-4-turbo' },
        { label: 'gpt-4', value: 'gpt-4' },
        { label: 'gpt-3.5-turbo', value: 'gpt-3.5-turbo' },
        { label: 'o1', value: 'o1' },
        { label: 'o1-mini', value: 'o1-mini' },
        { label: 'o1-pro', value: 'o1-pro' },
        { label: 'deepseek-chat', value: 'deepseek-chat' },
        { label: 'deepseek-reasoner', value: 'deepseek-reasoner' },
      ],
    },
  },

  renderMain(container, api) {
    const app = createApp(I18nPanel, {
      api,
      onRegisterRefresh: (fn: () => void) => {
        refreshSignal.value = fn;
      },
    });
    app.mount(container);
    return () => app.unmount();
  },

  renderSettings(container, api) {
    const app = createApp(I18nSettings, { api });
    app.mount(container);
    return () => app.unmount();
  },
};

export default plugin;
