<script setup lang="ts">
import { UInput, USelect } from '../index';
import UArrayInput from './UArrayInput.vue';

interface SettingSchemaDef {
  label: string;
  description?: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array';
  default?: unknown;
  options?: { label: string; value: unknown }[];
  items?: Record<string, SettingSchemaDef>;
  itemType?: 'string' | 'number';
}

const props = defineProps<{
  schema: Record<string, SettingSchemaDef>;
  modelValue: Record<string, unknown>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>];
}>();

const updateField = (key: string, value: unknown) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
};
</script>

<template>
  <div class="space-y-6">
    <div v-for="(def, key) in schema" :key="key" class="space-y-2">
      <!-- Label & Desc -->
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-200">
          {{ def.label }}
        </label>
        <span v-if="def.description" class="text-xs text-gray-500 dark:text-gray-400">
          {{ def.description }}
        </span>
      </div>

      <!-- Inputs based on type -->

      <!-- String / Number -->
      <UInput
        v-if="def.type === 'string' || def.type === 'number'"
        :model-value="String(modelValue[key] ?? def.default ?? '')"
        :type="def.type === 'number' ? 'number' : 'text'"
        @update:model-value="(val) => updateField(key, def.type === 'number' ? Number(val) : val)"
      />

      <!-- Boolean -->
      <label
        v-else-if="def.type === 'boolean'"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="checkbox"
          :checked="Boolean(modelValue[key] ?? def.default)"
          @change="(e: Event) => updateField(key, (e.target as HTMLInputElement).checked)"
          class="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        />
        <span class="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
      </label>

      <!-- Select -->
      <USelect
        v-else-if="def.type === 'select'"
        :model-value="String(modelValue[key] ?? def.default ?? '')"
        :options="def.options ? def.options.map((opt) => ({ label: opt.label, value: String(opt.value) })) : undefined"
        @update:model-value="(val: string) => updateField(key, val)"
      />

      <!-- Array (Complex) -->
      <UArrayInput
        v-else-if="def.type === 'array'"
        :model-value="(modelValue[key] ?? def.default ?? []) as unknown[]"
        :item-schema="def.items"
        :item-type="def.itemType"
        @update:model-value="(val: unknown[]) => updateField(key, val)"
      />
    </div>
  </div>
</template>

