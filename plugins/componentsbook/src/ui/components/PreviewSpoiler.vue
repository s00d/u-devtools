<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = withDefaults(
  defineProps<{
    showLabel?: string;
    hideLabel?: string;
  }>(),
  {
    showLabel: '▶ Show Code',
    hideLabel: '▼ Hide Code',
  }
);

const show = ref(false);
const spoilerHeader = ref<HTMLElement | null>(null);

function toggle() {
  show.value = !show.value;
  if (show.value) {
    nextTick(() => {
      spoilerHeader.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}
</script>

<template>
  <div>
    <div
      ref="spoilerHeader"
      class="flex items-center justify-start gap-2 bg-gray-800 border border-gray-700 rounded-md p-3 mt-4 cursor-pointer transition-colors hover:bg-gray-700"
      @click="toggle"
    >
      <span class="font-medium text-blue-400 text-sm rounded px-1">
        {{ show ? hideLabel : showLabel }}
      </span>
    </div>

    <div
      v-if="show"
      class="mt-2 p-3 bg-gray-900 border border-gray-700 rounded-md"
    >
      <slot />
    </div>
  </div>
</template>


