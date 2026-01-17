<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  score: number | null; // 0 to 1
  label?: string;
  size?: number;
}>();

const radius = 18;
const circumference = 2 * Math.PI * radius;

const colorClass = computed(() => {
  if (props.score === null) return 'text-gray-600';
  if (props.score >= 0.9) return 'text-green-500';
  if (props.score >= 0.5) return 'text-orange-500';
  return 'text-red-500';
});

const offset = computed(() => {
  if (props.score === null) return circumference;
  return circumference - props.score * circumference;
});

const displayValue = computed(() => {
  if (props.score === null) return '-';
  return Math.round(props.score * 100);
});
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <div
      class="relative flex items-center justify-center"
      :style="{ width: (size || 40) + 'px', height: (size || 40) + 'px' }"
    >
      <svg class="transform -rotate-90 w-full h-full">
        <!-- Background Ring -->
        <circle
          class="text-gray-800"
          stroke-width="3"
          stroke="currentColor"
          fill="transparent"
          :r="radius"
          cx="50%"
          cy="50%"
        />
        <!-- Progress Ring -->
        <circle
          :class="colorClass"
          stroke-width="3"
          stroke-dasharray="113"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          stroke="currentColor"
          fill="transparent"
          :r="radius"
          cx="50%"
          cy="50%"
          style="transition: stroke-dashoffset 0.5s ease"
        />
      </svg>
      <span class="absolute text-xs font-bold font-mono" :class="colorClass">
        {{ displayValue }}
      </span>
    </div>
    <span
      v-if="label"
      class="text-[10px] uppercase font-bold text-gray-500"
    >
      {{ label }}
    </span>
  </div>
</template>

