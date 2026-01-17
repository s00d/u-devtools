<script setup lang="ts">
import { ref } from 'vue';
import { tv } from 'tailwind-variants';
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

const keyValue = tv({
  base: 'flex items-start gap-4 py-2 border-b border-zinc-800 last:border-0 hover:bg-gray-800/50 transition-colors',
});

const keyValueValue = tv({
  base: 'text-gray-100 break-all',
  variants: {
    monospace: {
      true: 'font-mono text-sm',
      false: '',
    },
  },
  defaultVariants: {
    monospace: true,
  },
});
</script>

<template>
  <div :class="keyValue()">
    <div class="font-medium text-gray-400 w-32 flex-shrink-0">{{ label }}</div>
    <div class="flex-1 flex items-center gap-2 min-w-0">
      <span :class="keyValueValue({ monospace: monospace !== false })">
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

