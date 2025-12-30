<script setup lang="ts">
import { UButton, UInput, UIcon } from '../index';

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
  modelValue: unknown[];
  itemSchema?: Record<string, SettingSchemaDef>; // Если объекты
  itemType?: 'string' | 'number'; // Если примитивы
}>();

const emit = defineEmits<{
  'update:modelValue': [value: unknown[]];
}>();

const addItem = () => {
  const newItem = props.itemType ? '' : {};
  // Если это объект, заполняем дефолтными ключами
  if (!props.itemType && props.itemSchema) {
    Object.keys(props.itemSchema).forEach((k) => {
      // @ts-expect-error
      newItem[k] = props.itemSchema[k].default ?? '';
    });
  }
  emit('update:modelValue', [...(props.modelValue || []), newItem]);
};

const removeItem = (index: number) => {
  const newVal = [...props.modelValue];
  newVal.splice(index, 1);
  emit('update:modelValue', newVal);
};

const updateItemField = (index: number, key: string, value: unknown) => {
  const newVal = [...props.modelValue];
  newVal[index] = { ...(newVal[index] as Record<string, unknown>), [key]: value };
  emit('update:modelValue', newVal);
};

const updatePrimitiveItem = (index: number, value: unknown) => {
  const newVal = [...props.modelValue];
  newVal[index] = value;
  emit('update:modelValue', newVal);
};
</script>

<template>
  <div class="border border-gray-700 rounded-md overflow-hidden">
    <div
      class="bg-gray-800 px-3 py-2 border-b border-gray-700 flex justify-between items-center"
    >
      <span class="text-xs font-bold text-gray-400 uppercase">List Items</span>
      <UButton size="sm" icon="Plus" @click="addItem">Add</UButton>
    </div>

    <div class="p-2 space-y-2">
      <div v-if="!modelValue || modelValue.length === 0" class="text-center text-sm text-gray-500 py-2">
        No items defined
      </div>

      <div
        v-for="(item, idx) in modelValue"
        :key="idx"
        class="flex gap-2 items-start bg-gray-800/50 p-2 rounded"
      >
        <!-- Primitive Array (String/Number) -->
        <div v-if="itemType" class="flex-1">
          <UInput
            :model-value="String(item)"
            @update:model-value="(v) => updatePrimitiveItem(idx, itemType === 'number' ? Number(v) : v)"
            placeholder="Value..."
          />
        </div>

        <!-- Object Array -->
        <div
          v-else
          class="flex-1 grid gap-2"
          :class="Object.keys(itemSchema || {}).length > 1 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <div v-for="(fieldDef, fieldKey) in itemSchema" :key="String(fieldKey)">
            <UInput
              :model-value="String((item as Record<string, unknown>)[String(fieldKey)] ?? '')"
              :placeholder="String(fieldDef.label)"
              @update:model-value="(v) => updateItemField(idx, String(fieldKey), v)"
            />
          </div>
        </div>

        <button
          @click="removeItem(idx)"
          class="mt-1.5 text-gray-400 hover:text-red-500 transition"
          title="Remove"
        >
          <UIcon name="Trash" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

