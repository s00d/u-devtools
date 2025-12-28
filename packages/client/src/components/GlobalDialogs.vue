<script setup lang="ts">
import { dialogState } from '../modules/dialog';
import { UButton, UModal, UInput } from '@u-devtools/ui';
import { ref, watch } from 'vue';

const promptValue = ref('');

// Обработка confirm диалога
const handleConfirm = (result: boolean) => {
  if (dialogState.confirm.value) {
    dialogState.confirm.value.resolve(result);
    dialogState.confirm.value = null;
  }
};

// Обработка prompt диалога
const handlePrompt = (result: string | null) => {
  if (dialogState.prompt.value) {
    dialogState.prompt.value.resolve(result);
    dialogState.prompt.value = null;
    promptValue.value = '';
  }
};

// Сброс promptValue при открытии нового prompt
watch(
  () => dialogState.prompt.value,
  (newVal) => {
    if (newVal) {
      promptValue.value = newVal.defaultValue || '';
    }
  }
);
</script>

<template>
  <!-- Confirm Dialog -->
  <UModal
    v-if="dialogState.confirm.value"
    :visible="!!dialogState.confirm.value"
    @close="handleConfirm(false)"
  >
    <div class="p-6">
      <h3 class="text-lg font-bold text-white mb-2">
        {{ dialogState.confirm.value.title }}
      </h3>
      <p class="text-gray-400 mb-6">{{ dialogState.confirm.value.message }}</p>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="handleConfirm(false)">
          {{ dialogState.confirm.value.cancelText || 'Cancel' }}
        </UButton>
        <UButton variant="primary" @click="handleConfirm(true)">
          {{ dialogState.confirm.value.confirmText || 'Confirm' }}
        </UButton>
      </div>
    </div>
  </UModal>

  <!-- Prompt Dialog -->
  <UModal
    v-if="dialogState.prompt.value"
    :visible="!!dialogState.prompt.value"
    @close="handlePrompt(null)"
  >
    <div class="p-6">
      <h3 class="text-lg font-bold text-white mb-2">
        {{ dialogState.prompt.value.title }}
      </h3>
      <p class="text-gray-400 mb-4">{{ dialogState.prompt.value.message }}</p>
      <UInput v-model="promptValue" class="mb-6" @keyup.enter="handlePrompt(promptValue)" />
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="handlePrompt(null)">Cancel</UButton>
        <UButton variant="primary" @click="handlePrompt(promptValue)">OK</UButton>
      </div>
    </div>
  </UModal>
</template>

