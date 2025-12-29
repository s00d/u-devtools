<script setup lang="ts">
import { UCodeBlock, UButton } from '@u-devtools/ui';

defineProps<{
  code: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

function close() {
  emit('close');
}
</script>

<template>
  <div class="absolute left-0 top-0 h-full w-full flex flex-col rounded-br-lg rounded-tr-lg bg-gray-800 border border-gray-700 p-4 z-50">
    <div class="h-12 w-full flex items-center justify-between mb-4">
      <span class="font-semibold text-white">Render Code</span>
      <UButton
        variant="ghost"
        size="sm"
        icon="XMark"
        @click="close"
      >
        Close
      </UButton>
    </div>
    <div class="flex-1 overflow-auto">
      <UCodeBlock :code="code" lang="javascript" />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

