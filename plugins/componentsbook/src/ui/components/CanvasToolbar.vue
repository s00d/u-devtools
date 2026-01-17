<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
import type { CanvasSettings } from '../../types';

const props = defineProps<{
  settings: CanvasSettings;
}>();

const emit = defineEmits<{
  'update:viewport': [name: string];
  'toggle-rotate': [];
  'zoom-in': [];
  'zoom-out': [];
  'reset-zoom': [];
  'change-bg': [bg: string];
}>();

const bgOptions = [
  { label: 'Grid', value: 'grid' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'Transparent', value: 'transparent' },
];

const vpOptions = [
  { label: 'Responsive', value: 'responsive' },
  { label: 'Mobile (375px)', value: 'mobile' },
  { label: 'Tablet (768px)', value: 'tablet' },
  { label: 'Desktop (1280px)', value: 'desktop' },
];
</script>

<template>
  <div class="h-10 border-b border-gray-700 bg-gray-800 px-3 flex items-center justify-between select-none">
    <!-- Left: Viewport -->
    <div class="flex items-center gap-2">
      <UIcon name="DevicePhoneMobile" class="w-4 h-4 text-gray-400" />
      <select 
        :value="settings.viewport.name" 
        @change="emit('update:viewport', ($event.target as HTMLSelectElement).value)"
        class="bg-gray-900 border border-gray-600 text-xs rounded px-2 py-1 text-gray-300 outline-none focus:border-indigo-500"
      >
        <option v-for="opt in vpOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      
      <button 
        v-if="settings.viewport.name !== 'responsive'"
        @click="emit('toggle-rotate')"
        class="p-1 rounded hover:bg-gray-700 text-gray-400"
        title="Rotate"
      >
        <UIcon name="ArrowPath" class="w-3.5 h-3.5" />
      </button>

      <span class="text-[10px] font-mono text-gray-500 ml-2">
        {{ settings.viewport.width === '100%' ? 'Auto' : settings.viewport.width }} 
        x 
        {{ settings.viewport.height === '100%' ? 'Auto' : settings.viewport.height }}
      </span>
    </div>

    <!-- Center: Zoom -->
    <div class="flex items-center gap-1 bg-gray-900 rounded p-0.5">
      <button @click="emit('zoom-out')" class="px-2 hover:text-white text-gray-400">-</button>
      <button @click="emit('reset-zoom')" class="px-2 text-xs font-mono text-gray-300 min-w-[3rem]">
        {{ Math.round(settings.zoom * 100) }}%
      </button>
      <button @click="emit('zoom-in')" class="px-2 hover:text-white text-gray-400">+</button>
    </div>

    <!-- Right: Background -->
    <div class="flex items-center gap-2">
      <button 
        v-for="bg in bgOptions" 
        :key="bg.value"
        @click="emit('change-bg', bg.value)"
        class="w-5 h-5 rounded border border-gray-600 transition-transform hover:scale-110"
        :class="{ 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-gray-800': settings.background === bg.value }"
        :style="{
          background: bg.value === 'light' ? '#fff' : bg.value === 'dark' ? '#1f2937' : bg.value === 'transparent' ? 'transparent' : 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGUlEQVQYV2NkYGA4wxAWwIiMREdE4V98CgB+EQr1y+2s1wAAAABJRU5ErkJggg==)'
        }"
        :title="bg.label"
      ></button>
    </div>
  </div>
</template>
