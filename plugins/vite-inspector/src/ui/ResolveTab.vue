<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UInput, UBadge, ULoading, UIcon } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

const resolveInput = ref('');
const resolveResult = ref<{
  id: string | null;
  external: boolean;
  error: string | null;
} | null>(null);
const resolving = ref(false);

const debugResolve = async () => {
  if (!resolveInput.value.trim()) return;
  resolving.value = true;
  try {
    resolveResult.value = await props.api.rpc.call('vite:resolve', {
      id: resolveInput.value.trim(),
    });
  } catch (e) {
    props.api.notify(`Resolve failed: ${e}`, 'error');
  } finally {
    resolving.value = false;
  }
};
</script>

<template>
  <div class="flex-1 overflow-auto p-8">
    <div class="max-w-2xl mx-auto w-full">
      <h2 class="text-xl font-bold mb-2 text-white">Resolve Debugger</h2>
      <p class="text-gray-400 mb-6 text-sm">Check how Vite resolves imports and aliases.</p>

      <div class="flex gap-2 mb-6">
        <UInput
          v-model="resolveInput"
          placeholder="e.g. @/components/App.vue or vue or ./Button"
          class="flex-1"
          @keydown.enter="debugResolve"
        />
        <UButton variant="primary" @click="debugResolve" :disabled="resolving">
          <UIcon name="MagnifyingGlass" class="w-4 h-4" />
          Resolve
        </UButton>
      </div>

      <div v-if="resolving" class="flex justify-center py-8">
        <ULoading />
      </div>

      <div v-else-if="resolveResult" class="p-4 border border-gray-700 rounded bg-gray-800">
        <div v-if="resolveResult.error" class="text-red-400 font-mono text-sm">
          <div class="text-xs text-gray-400 uppercase font-bold mb-1">Error</div>
          {{ resolveResult.error }}
        </div>
        <div v-else>
          <div class="text-xs text-gray-400 uppercase font-bold mb-1">Resolved Path</div>
          <div class="font-mono break-all text-green-400 mb-4 text-sm">{{ resolveResult.id }}</div>

          <div class="text-xs text-gray-400 uppercase font-bold mb-1">External</div>
          <div class="font-mono text-sm text-gray-300">
            <UBadge :color="resolveResult.external ? 'yellow' : 'green'">
              {{ resolveResult.external ? 'Yes (external)' : 'No (bundled)' }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
