<script setup lang="ts">
import { UBadge, UIcon } from '@u-devtools/ui';
import type { DiffResult } from '../../utils/diff';

defineProps<{
  diffs: DiffResult[];
}>();

const statusColor = (status: string) => {
  switch (status) {
    case 'match':
      return 'green';
    case 'mismatch':
      return 'orange';
    case 'client-only':
      return 'red'; // Dangerous for SEO
    case 'server-only':
      return 'blue';
    default:
      return 'gray';
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'match':
      return 'Match';
    case 'mismatch':
      return 'Mismatch';
    case 'client-only':
      return 'Client Only (JS)';
    case 'server-only':
      return 'Server Only';
    default:
      return status;
  }
};
</script>

<template>
  <div class="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
    <div
      class="grid grid-cols-[120px_1fr_1fr_100px] gap-2 p-3 bg-gray-900 border-b border-gray-700 font-bold text-xs text-gray-400 uppercase"
    >
      <div>Tag</div>
      <div>Client (Current)</div>
      <div>Server (Initial)</div>
      <div>Status</div>
    </div>

    <div class="divide-y divide-gray-700/50">
      <div
        v-for="item in diffs"
        :key="item.key"
        class="grid grid-cols-[120px_1fr_1fr_100px] gap-2 p-3 text-sm hover:bg-gray-700/30 transition-colors items-center"
      >
        <div class="font-medium text-gray-300">{{ item.label }}</div>

        <div
          class="break-all text-gray-400"
          :class="{ 'text-white font-medium': item.status === 'client-only' }"
        >
          {{ item.clientValue || '-' }}
        </div>

        <div
          class="break-all text-gray-400"
          :class="{ 'text-white font-medium': item.status === 'server-only' }"
        >
          {{ item.serverValue || '-' }}
        </div>

        <div>
          <UBadge :color="statusColor(item.status) as any" size="xs">
            {{ statusLabel(item.status) }}
          </UBadge>
        </div>
      </div>
    </div>

    <div class="p-3 bg-gray-900/50 border-t border-gray-700 text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <UIcon name="ExclamationTriangle" class="w-4 h-4 text-red-400" />
        <span
          >"Client Only" means the tag is missing in the raw HTML. Bots that
          don't execute JS won't see it.</span
        >
      </div>
    </div>
  </div>
</template>

