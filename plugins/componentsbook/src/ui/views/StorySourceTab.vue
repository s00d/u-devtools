<script setup lang="ts">
import { UCodeBlock } from '@u-devtools/ui';

defineProps<{
  sourceCode: string;
}>();
</script>

<template>
  <div class="h-full overflow-hidden">
    <UCodeBlock :code="sourceCode" language="vue" class="h-full rounded-none border-0" />
  </div>
</template>
