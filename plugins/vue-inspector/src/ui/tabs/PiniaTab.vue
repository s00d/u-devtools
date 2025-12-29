<script setup lang="ts">
import { onMounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UInput, USplitter, ULoading } from '@u-devtools/ui';
import { usePiniaStores } from '../../composables/usePiniaStores';
import PiniaTree from '../components/PiniaTree.vue';
import PiniaState from '../components/PiniaState.vue';

const props = defineProps<{ api: ClientApi }>();

const pinia = usePiniaStores();

const handleSelect = async (node: { id: string }) => {
  await pinia.selectStore(node as Parameters<typeof pinia.selectStore>[0]);
};

const handleToggleExpanded = (nodeId: string) => {
  pinia.toggleExpanded(nodeId);
};

onMounted(() => {
  pinia.getStoresTree();
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900">
    <!-- Toolbar -->
    <div class="flex-none px-4 py-3 border-b border-gray-700 bg-gray-800 flex items-center gap-4">
      <UInput
        v-model="pinia.filterStoreKey.value"
        placeholder="Filter stores..."
        class="w-64"
      />
      <UInput
        v-model="pinia.filterStateKey.value"
        placeholder="Filter state..."
        class="w-64"
      />
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden relative">
      <div v-if="pinia.isLoading.value" class="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
        <ULoading text="Loading Pinia stores..." />
      </div>
      <USplitter :defaultSize="300" class="flex-1">
        <template #left>
          <PiniaTree
            :tree="pinia.storesTree.value"
            :selected-id="pinia.selectedStoreId.value"
            :expanded-nodes="pinia.expandedNodes.value"
            @select="handleSelect"
            @toggle-expanded="handleToggleExpanded"
          />
        </template>
        <template #right>
          <PiniaState
            :state="pinia.storeState.value"
            :is-loading="pinia.isLoading.value"
          />
        </template>
      </USplitter>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

