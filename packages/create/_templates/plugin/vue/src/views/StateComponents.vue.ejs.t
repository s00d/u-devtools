---
to: <%= projectName %>/src/views/StateComponents.vue
---
<script setup lang="ts">
import { ref, computed } from 'vue';
import { UCard, UButton } from '@u-devtools/ui';

const isLoading = ref(false);
const isEnabled = ref(true);
const message = ref('Initial state');

const status = computed(() => {
  if (isLoading.value) return 'Loading...';
  if (!isEnabled.value) return 'Disabled';
  return 'Ready';
});

const toggleLoading = () => {
  isLoading.value = !isLoading.value;
  setTimeout(() => {
    isLoading.value = false;
  }, 2000);
};
</script>

<template>
  <div class="space-y-6">
    <UCard title="State Components">
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold mb-2">Status: {{ status }}</h3>
          <div class="flex gap-2">
            <UButton
              :label="isLoading ? 'Loading...' : 'Toggle Loading'"
              :disabled="isLoading"
              @click="toggleLoading"
            />
            <UButton
              :label="isEnabled ? 'Disable' : 'Enable'"
              @click="isEnabled = !isEnabled"
            />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Message</h3>
          <input
            v-model="message"
            type="text"
            class="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Enter message"
          />
          <p class="mt-2 text-sm text-gray-400">{{ message }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

