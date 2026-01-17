<script setup lang="ts">
import { UButton, ULoading, UIcon } from '@u-devtools/ui';
import type { DiffResult } from '../../utils/diff';
import SsrDiff from '../components/SsrDiff.vue';

defineProps<{
  diffs: DiffResult[];
  isComparing: boolean;
  onRefresh: () => void;
}>();
</script>

<template>
  <div class="px-4 pt-4 pb-4 space-y-4">
    <div v-if="isComparing" class="flex justify-center py-10">
      <ULoading text="Fetching server HTML..." />
    </div>

    <div v-else-if="diffs.length > 0">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="font-bold text-white">Hydration Mismatch Check</h3>
        <UButton
          size="sm"
          variant="secondary"
          icon="ArrowPath"
          @click="onRefresh"
        >
          Re-check
        </UButton>
      </div>
      <SsrDiff :diffs="diffs" />
    </div>

    <div v-else class="text-center py-10 text-gray-500">
      <UIcon name="DocumentText" class="w-12 h-12 mx-auto mb-2 opacity-30" />
      <p>No SSR comparison data available.</p>
      <p class="text-xs mt-2">
        Click "Re-check" to compare server HTML with current DOM.
      </p>
    </div>
  </div>
</template>

