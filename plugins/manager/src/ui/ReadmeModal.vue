<script setup lang="ts">
import { UModal, UIcon } from '@u-devtools/ui';

const props = defineProps<{
  visible: boolean;
  loading: boolean;
  readmeHtml: string;
}>();

defineEmits<{
  close: [];
}>();
</script>

<template>
  <UModal :visible="visible" title="README" size="lg" @close="$emit('close')">
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2"></div>
        <p class="text-sm text-zinc-400">Loading README...</p>
      </div>
    </div>
    <div
      v-else
      class="prose prose-invert max-w-none"
      v-html="readmeHtml"
    ></div>
  </UModal>
</template>

<style scoped>
.prose {
  color: #e4e4e7;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4 {
  color: #f4f4f5;
  font-weight: 600;
}

.prose a {
  color: #818cf8;
  text-decoration: none;
}

.prose a:hover {
  color: #6366f1;
  text-decoration: underline;
}

.prose code {
  background: #27272a;
  color: #f4f4f5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.prose pre {
  background: #18181b;
  color: #f4f4f5;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.prose pre code {
  background: transparent;
  padding: 0;
}
</style>

