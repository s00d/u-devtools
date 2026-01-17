<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { UCodeBlock } from '@u-devtools/ui';

const props = withDefaults(
  defineProps<{
    code: string;
    showFrozen?: boolean;
    isFrozen?: boolean;
  }>(),
  {
    showFrozen: true,
    isFrozen: false,
  }
);

const emit = defineEmits<{
  copy: [];
  'toggle-freeze': [];
}>();

const copyButtonText = ref('📋 Copy');
const formattedCode = ref(props.code);

async function copyCode() {
  try {
    await navigator.clipboard.writeText(formattedCode.value);
    copyButtonText.value = '✅ Copied!';
    setTimeout(() => {
      copyButtonText.value = '📋 Copy';
    }, 2000);
    emit('copy');
  } catch (err) {
    console.error('[PreviewCodeBlock] Failed to copy:', err);
  }
}

function toggleFreeze() {
  emit('toggle-freeze');
}

watchEffect(() => {
  formattedCode.value = props.code;
});
</script>

<template>
  <div class="relative bg-gray-800 rounded-md p-4 mt-2 overflow-auto border border-gray-700 shadow-sm">
    <div class="absolute top-3 right-3 flex gap-2 z-10">
      <button
        v-if="showFrozen"
        class="px-3 py-1.5 text-xs font-medium bg-gray-600 text-white rounded cursor-pointer transition-colors hover:bg-gray-500 active:shadow-inner"
        @click="toggleFreeze"
      >
        {{ isFrozen ? '❄️ Unfreeze' : '❄️ Freeze Code' }}
      </button>
      <button
        class="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded cursor-pointer transition-colors hover:bg-blue-500 active:shadow-inner"
        @click="copyCode"
      >
        {{ copyButtonText }}
      </button>
    </div>
    <UCodeBlock :code="formattedCode" language="vue" />
  </div>
</template>


