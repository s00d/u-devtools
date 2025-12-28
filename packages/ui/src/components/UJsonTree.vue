<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';

defineProps<{
  data: unknown;
  editable?: boolean;
  deep?: number;
}>();
</script>

<template>
  <div class="udt-json-tree text-sm font-mono overflow-auto">
    <VueJsonPretty :data="data as any" :editable="editable" :deep="deep ?? 3" />
  </div>
</template>

<style scoped>
.udt-json-tree :deep(.vjs-tree) {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.udt-json-tree :deep(.vjs-tree-node:hover) {
  background-color: rgba(99, 102, 241, 0.1);
}

.udt-json-tree :deep(.vjs-tree-node.is-highlight) {
  background-color: rgba(99, 102, 241, 0.2);
}

/* Dark mode support */
html.dark .udt-json-tree :deep(.vjs-tree-node) {
  color: #f9fafb;
}

html.dark .udt-json-tree :deep(.vjs-key) {
  color: #60a5fa;
}

html.dark .udt-json-tree :deep(.vjs-value-string) {
  color: #34d399;
}

html.dark .udt-json-tree :deep(.vjs-value-number) {
  color: #fbbf24;
}
</style>

