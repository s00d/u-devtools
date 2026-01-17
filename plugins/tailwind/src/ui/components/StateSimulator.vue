<script setup lang="ts">
import { ref } from 'vue';
import { UButton } from '@u-devtools/ui';
import { useBridge } from '../../context';

const props = defineProps<{
  elementId: string | null;
}>();

const bridge = useBridge();
const activeStates = ref<Set<string>>(new Set());

const toggleState = (state: 'hover' | 'focus' | 'active') => {
  if (activeStates.value.has(state)) {
    activeStates.value.delete(state);
  } else {
    activeStates.value.add(state);
  }

  // Send state to app context to apply pseudo-class styles
  if (props.elementId) {
    bridge.send('simulate-state', {
      udtId: String(props.elementId),
      states: Array.from(activeStates.value).map(String), // Ensure all items are strings
    });
  }
};
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-800 rounded border border-gray-700">
    <h3 class="text-xs font-bold text-gray-400 uppercase">State Simulator</h3>
    <div class="flex gap-2">
      <UButton
        size="xs"
        :variant="activeStates.has('hover') ? 'primary' : 'secondary'"
        @click="toggleState('hover')"
      >
        :hover
      </UButton>
      <UButton
        size="xs"
        :variant="activeStates.has('focus') ? 'primary' : 'secondary'"
        @click="toggleState('focus')"
      >
        :focus
      </UButton>
      <UButton
        size="xs"
        :variant="activeStates.has('active') ? 'primary' : 'secondary'"
        @click="toggleState('active')"
      >
        :active
      </UButton>
    </div>
    <p class="text-[10px] text-gray-500">
      Force pseudo-class states without real interaction
    </p>
  </div>
</template>

