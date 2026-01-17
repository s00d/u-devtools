<script setup lang="ts">
import { ref, computed } from 'vue';
import { UButton, USelect, UCodeBlock, UIcon } from '@u-devtools/ui';

const props = defineProps<{
  classes: string[];
  tagName: string;
}>();

const format = ref<'html' | 'jsx' | 'vue'>('html');
const copied = ref(false);

const code = computed(() => {
  const clsString = props.classes.join(' ');

  if (format.value === 'jsx') {
    return `<${props.tagName} className="${clsString}">\n  ...\n</${props.tagName}>`;
  }
  if (format.value === 'vue') {
    return `<${props.tagName} class="${clsString}">\n  ...\n</${props.tagName}>`;
  }
  // HTML
  return `<${props.tagName} class="${clsString}">\n  ...\n</${props.tagName}>`;
});

const justClasses = computed(() => props.classes.join(' '));

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
};
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-800 rounded border border-gray-700">
    <div class="flex justify-between items-center">
      <h3 class="text-xs font-bold text-gray-400 uppercase">Export Code</h3>
      <div class="flex gap-2">
        <USelect
          v-model="format"
          :options="[
            { label: 'HTML', value: 'html' },
            { label: 'JSX/React', value: 'jsx' },
            { label: 'Vue', value: 'vue' },
          ]"
          size="xs"
          class="w-28"
        />
      </div>
    </div>

    <!-- Quick Copy Classes -->
    <div class="flex gap-2">
      <input
        readonly
        :value="justClasses"
        class="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs font-mono text-gray-300 truncate cursor-text"
        @click="(e: any) => e.target.select()"
      />
      <UButton size="xs" icon="Clipboard" @click="copy(justClasses)">
        {{ copied ? 'Copied!' : 'Copy Classes' }}
      </UButton>
    </div>

    <!-- Full Snippet -->
    <div class="relative group">
      <UCodeBlock :code="code" language="html" class="max-h-32 text-xs" />
      <button
        @click="copy(code)"
        class="absolute top-2 right-2 p-1.5 bg-gray-700 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600"
        title="Copy full code"
      >
        <UIcon name="Clipboard" class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>

