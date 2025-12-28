<script setup lang="ts">
defineProps<{
  language?: string;
}>();
</script>

<template>
  <div class="relative group bg-gray-900 rounded-md overflow-hidden text-gray-100 font-mono text-sm">
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
      <slot name="actions" />
    </div>
    <pre class="whitespace-pre-wrap break-all p-4"><slot /></pre>
  </div>
</template>

