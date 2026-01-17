<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { UModal, UInput, USelect, UButton } from '@u-devtools/ui';
import type { MockRule } from '../../types';

const props = defineProps<{
  visible: boolean;
  rule?: MockRule; // If editing
}>();

const emit = defineEmits<{
  close: [];
  save: [rule: MockRule];
}>();

// Form state
const method = ref(props.rule?.method || 'GET');
const urlMatcher = ref(props.rule?.urlMatcher || '');
const status = ref(props.rule?.responseStatus || 200);
const delay = ref(props.rule?.responseDelay || 0);
const body = ref(props.rule?.responseBody || '{\n  "message": "Hello Mock"\n}');

// Reset form when modal opens
watch(
  () => props.visible,
  (isVisible) => {
    if (isVisible) {
      method.value = props.rule?.method || 'GET';
      urlMatcher.value = props.rule?.urlMatcher || '';
      status.value = props.rule?.responseStatus || 200;
      delay.value = props.rule?.responseDelay || 0;
      body.value = props.rule?.responseBody || '{\n  "message": "Hello Mock"\n}';
    }
  }
);

const isValidJson = computed(() => {
  if (!body.value.trim()) return false;
  try {
    JSON.parse(body.value);
    return true;
  } catch {
    return false;
  }
});

const handleSave = () => {
  if (!isValidJson.value || !urlMatcher.value.trim()) return;

  const newRule: MockRule = {
    id: props.rule?.id || Math.random().toString(36).slice(2),
    active: props.rule?.active ?? true,
    method: method.value,
    urlMatcher: urlMatcher.value.trim(),
    responseStatus: Number(status.value),
    responseDelay: Number(delay.value),
    responseType: 'json',
    responseBody: body.value.trim(),
    responseHeaders: { 'Content-Type': 'application/json' },
  };

  emit('save', newRule);
};
</script>

<template>
  <UModal :visible="visible" title="Mock Rule" @close="$emit('close')">
    <div class="p-4 space-y-4">
      <div class="grid grid-cols-4 gap-2">
        <USelect
          v-model="method"
          :options="[
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
            { label: 'PATCH', value: 'PATCH' },
            { label: '*', value: '*' },
          ]"
        />
        <div class="col-span-3">
          <UInput
            v-model="urlMatcher"
            placeholder="/api/users (partial match or regex)"
          />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="text-xs text-gray-400 block mb-1">Status Code</label>
          <UInput type="number" v-model="status" />
        </div>
        <div>
          <label class="text-xs text-gray-400 block mb-1">Delay (ms)</label>
          <UInput type="number" v-model="delay" />
        </div>
      </div>

      <div>
        <label class="text-xs text-gray-400 block mb-1"
          >Response Body (JSON)</label
        >
        <textarea
          v-model="body"
          class="w-full h-48 bg-gray-900 text-gray-200 font-mono text-sm p-3 rounded border border-gray-700 focus:border-indigo-500 outline-none resize-none"
          :class="{ 'border-red-500': !isValidJson }"
        ></textarea>
        <div v-if="!isValidJson && body.trim()" class="text-red-400 text-xs mt-1">
          Invalid JSON
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <UButton variant="ghost" @click="$emit('close')">Cancel</UButton>
        <UButton
          variant="primary"
          :disabled="!isValidJson || !urlMatcher.trim()"
          @click="handleSave"
        >
          Save Rule
        </UButton>
      </div>
    </div>
  </UModal>
</template>

