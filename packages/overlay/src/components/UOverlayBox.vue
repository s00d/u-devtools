<script setup lang="ts">
import { computed } from 'vue';
import type { ElementRect } from '../composables/useElementRect';

const props = defineProps<{
  rect: ElementRect;
  color: string; // Цвет основной границы
  showModel?: boolean; // Показывать ли margin/padding
  label?: string;
}>();

// SVG Path для Margin
const marginPath = computed(() => {
  const { width, height, marginTop, marginRight, marginBottom, marginLeft } = props.rect;
  // Outer box (margin edge)
  const outer = `M ${-marginLeft},${-marginTop} h ${width + marginLeft + marginRight} v ${height + marginTop + marginBottom} h ${-(width + marginLeft + marginRight)} z`;
  // Inner box (border edge) - вырезаем дырку
  const inner = `M 0,0 v ${height} h ${width} v ${-height} z`;
  return `${outer} ${inner}`;
});

// SVG Path для Padding
const paddingPath = computed(() => {
  const { width, height, borderTop, borderRight, borderBottom, borderLeft, paddingTop, paddingRight, paddingBottom, paddingLeft } = props.rect;
  // Border edge (outer padding edge)
  const outer = `M ${borderLeft},${borderTop} h ${width - borderLeft - borderRight} v ${height - borderTop - borderBottom} h ${-(width - borderLeft - borderRight)} z`;
  // Content edge (inner padding edge)
  const inner = `M ${borderLeft + paddingLeft},${borderTop + paddingTop} v ${height - borderTop - borderBottom - paddingTop - paddingBottom} h ${width - borderLeft - borderRight - paddingLeft - paddingRight} v ${-(height - borderTop - borderBottom - paddingTop - paddingBottom)} z`;
  return `${outer} ${inner}`;
});

// Tooltip position (always strictly above or below)
const tooltipStyle = computed(() => {
  const onTop = props.rect.top > 30; // Если есть место сверху
  const bottom = props.rect.top + props.rect.height; // Вычисляем bottom
  return {
    transform: `translate(${props.rect.left}px, ${onTop ? props.rect.top - 24 : bottom + 4}px)`
  };
});
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[9000]">
    <!-- Main container positioned at element -->
    <div
      class="absolute transition-none will-change-transform"
      :style="{
        transform: `translate(${rect.left}px, ${rect.top}px)`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      }"
    >
      <!-- Border Highlight -->
      <div 
        class="absolute inset-0 border-2 z-20"
        :style="{ borderColor: color }"
      ></div>

      <!-- Box Model Visualization (SVG Overlay) -->
      <svg 
        v-if="showModel"
        class="absolute overflow-visible z-10" 
        :style="{ top: 0, left: 0, width: '100%', height: '100%' }"
      >
        <!-- Margin Area (Orange) -->
        <path :d="marginPath" fill="rgba(249, 204, 157, 0.4)" />
        <!-- Padding Area (Green) -->
        <path :d="paddingPath" fill="rgba(195, 224, 180, 0.4)" />
        <!-- Content Area (Blue) is implied by the hole in padding -->
        <rect 
          :x="rect.borderLeft + rect.paddingLeft" 
          :y="rect.borderTop + rect.paddingTop" 
          :width="Math.max(0, rect.width - rect.borderLeft - rect.borderRight - rect.paddingLeft - rect.paddingRight)" 
          :height="Math.max(0, rect.height - rect.borderTop - rect.borderBottom - rect.paddingTop - rect.paddingBottom)"
          fill="rgba(160, 197, 232, 0.4)"
        />
      </svg>
    </div>

    <!-- Label -->
    <div
      v-if="label"
      class="absolute px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-sm z-[9030] whitespace-nowrap"
      :style="{ ...tooltipStyle, backgroundColor: color }"
    >
      {{ label }}
    </div>
  </div>
</template>
