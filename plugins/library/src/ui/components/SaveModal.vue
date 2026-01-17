<script setup lang="ts">
import { ref, watch } from 'vue';
import { UModal, UInput, UButton, UIcon } from '@u-devtools/ui';
import type { ComponentSnippet } from '../../types';

const props = defineProps<{
  show: boolean;
  html: string;
  defaultName?: string;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  save: [snippet: ComponentSnippet];
}>();

const name = ref(props.defaultName || '');
const category = ref('User');
const tags = ref('');

const categories = ['User', 'Buttons', 'Cards', 'Forms', 'Layout', 'Navigation', 'Feedback'];

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      name.value = props.defaultName || '';
      category.value = 'User';
      tags.value = '';
    }
  }
);

const handleSave = () => {
  if (!name.value.trim()) {
    return;
  }

  const snippet: ComponentSnippet = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: name.value.trim(),
    category: category.value,
    html: props.html,
    tags: tags.value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    isCustom: true,
  };

  emit('save', snippet);
  emit('update:show', false);
};

const handleCancel = () => {
  emit('update:show', false);
};
</script>

<template>
  <UModal :visible="show" @close="handleCancel" title="Save Component">
    <div class="space-y-4 p-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Name</label>
        <UInput v-model="name" placeholder="Component name" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Category</label>
        <select
          v-model="category"
          class="w-full px-3 py-2 bg-[#2d2d2d] border border-[#444] rounded text-white text-sm focus:outline-none focus:border-indigo-500"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1">Tags (comma-separated)</label>
        <UInput v-model="tags" placeholder="button, primary, cta" />
      </div>

      <div class="flex gap-2 justify-end pt-2">
        <UButton variant="ghost" @click="handleCancel">Cancel</UButton>
        <UButton variant="primary" @click="handleSave" :disabled="!name.trim()">Save</UButton>
      </div>
    </div>
  </UModal>
</template>

