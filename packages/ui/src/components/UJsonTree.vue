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
  <div class="text-sm font-mono overflow-auto [&_.vjs-tree]:font-mono [&_.vjs-tree]:text-sm [&_.vjs-tree]:leading-relaxed [&_.vjs-tree-node:hover]:bg-indigo-500/10 [&_.vjs-tree-node.is-highlight]:bg-indigo-500/20 dark:[&_.vjs-tree-node]:text-gray-50 dark:[&_.vjs-key]:text-blue-400 dark:[&_.vjs-value-string]:text-emerald-400 dark:[&_.vjs-value-number]:text-yellow-400">
    <VueJsonPretty :data="data as any" :editable="editable" :deep="deep ?? 3" />
  </div>
</template>

