<script setup lang="ts">
import { ref } from 'vue';
import UIcon from './UIcon.vue';

defineProps<{
  label: string;
  value: string | number;
  copyable?: boolean;
  monospace?: boolean;
}>();

const copied = ref(false);

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Ignore
  }
};
</script>

<template>
  <div class="flex items-start gap-4 py-2 border-b border-zinc-800 last:border-0 hover:bg-gray-800/50 transition-colors">
    <div class="font-medium text-gray-400 w-32 flex-shrink-0">{{ label }}</div>
    <div class="flex-1 flex items-center gap-2 min-w-0">
      <span
        :class="[
          'text-gray-100 break-all',
          monospace !== false ? 'font-mono text-sm' : '',
        ]"
      >
        {{ value }}
      </span>
      <button
        v-if="copyable"
        @click="copy(String(value))"
        class="flex-shrink-0 text-gray-400 hover:text-indigo-400 transition-colors"
        title="Copy to clipboard"
      >
        <UIcon :name="copied ? 'Check' : 'Clipboard'" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

