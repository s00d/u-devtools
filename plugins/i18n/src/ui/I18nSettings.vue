<script setup lang="ts">
import { computed } from 'vue';
import { UInput, USelect } from '@u-devtools/ui';
import type { PluginSettingsSchema, ClientApi } from '@u-devtools/core';

const props = defineProps<{
  api: ClientApi;
}>();

// Read current settings from API
const currentSettings = computed(() => props.api.settings.all);
const selectedDriver = computed(() =>
  String(currentSettings.value.translationDriver || 'disabled')
);

// Update field in settings API
const updateField = (key: string, value: unknown) => {
  props.api.settings.set(key, value);
};

// Handle input update (string or number)
const handleInputUpdate = (key: string, def: { type?: string }, val: string): void => {
  const value: string | number = def.type === 'number' ? Number(val) : val;
  updateField(key, value);
};

// Handle select update
const handleSelectUpdate = (key: string, val: string): void => {
  updateField(key, val);
};

const baseSchema: PluginSettingsSchema = {
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
};

const apiTokenSchema: PluginSettingsSchema = {
  translationApiToken: {
    label: 'API Token',
    type: 'string',
    default: '',
    description: 'Required for all translation services except Google Free. Keep this secure!',
  },
};

const folderIdSchema: PluginSettingsSchema = {
  translationFolderId: {
    label: 'Yandex Cloud Folder ID',
    type: 'string',
    default: '',
    description: 'Required only for Yandex Cloud translation service',
  },
};

const formalitySchema: PluginSettingsSchema = {
  translationFormality: {
    label: 'DeepL Formality',
    type: 'select',
    default: 'default',
    description: 'Applies only to DeepL translation service',
    options: [
      { label: 'Neutral (Default)', value: 'default' },
      { label: 'Formal Tone', value: 'more' },
      { label: 'Casual Tone', value: 'less' },
    ],
  },
};

const modelSchema: PluginSettingsSchema = {
  translationModel: {
    label: 'AI Model',
    type: 'select',
    default: 'gpt-3.5-turbo',
    description: 'Applies only to OpenAI and DeepSeek translation services',
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
};

const fullSchema = computed(() => {
  const schema: PluginSettingsSchema = { ...baseSchema };

  // API Token - показываем для всех, кроме disabled и google-free
  if (selectedDriver.value !== 'disabled' && selectedDriver.value !== 'google-free') {
    Object.assign(schema, apiTokenSchema);
  }

  // Folder ID - только для yandex-cloud
  if (selectedDriver.value === 'yandex-cloud') {
    Object.assign(schema, folderIdSchema);
  }

  // Formality - только для deepl
  if (selectedDriver.value === 'deepl') {
    Object.assign(schema, formalitySchema);
  }

  // Model - только для openai и deepseek
  if (selectedDriver.value === 'openai' || selectedDriver.value === 'deepseek') {
    Object.assign(schema, modelSchema);
  }

  return schema;
});
</script>

<template>
  <div class="space-y-6">
    <div v-for="(def, key) in fullSchema" :key="key" class="space-y-2">
      <!-- Label & Desc -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-200">
          {{ def.label }}
        </label>
        <span v-if="def.description" class="text-xs text-gray-400">
          {{ def.description }}
        </span>
      </div>

      <!-- String / Number -->
      <UInput
        v-if="def.type === 'string' || def.type === 'number'"
        :model-value="String(currentSettings[key] ?? def.default ?? '')"
        :type="key === 'translationApiToken' ? 'password' : (def.type === 'number' ? 'number' : 'text')"
        @update:model-value="(val: string) => handleInputUpdate(String(key), def, val)"
      />

      <!-- Select -->
      <USelect
        v-else-if="def.type === 'select'"
        :model-value="String(currentSettings[key] ?? def.default ?? '')"
        :options="def.options ? def.options.map((opt) => ({ label: opt.label, value: String(opt.value) })) : undefined"
        @update:model-value="(val: string) => handleSelectUpdate(String(key), val)"
      />
    </div>
  </div>
</template>

