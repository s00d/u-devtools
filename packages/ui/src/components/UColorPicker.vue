<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';
import type { ColorOption } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    type?: 'text' | 'bg' | 'border';
    size?: 'xs' | 'sm' | 'md';
    showOpacity?: boolean;
    showNone?: boolean;
    /**
     * Color options to display. If not provided, component will be empty.
     */
    colors?: ColorOption[];
    /**
     * Opacity values to display. Default: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
     */
    opacityValues?: number[];
    /**
     * Title for the dropdown menu
     */
    title?: string;
  }>(),
  {
    type: 'text',
    size: 'sm',
    showOpacity: true,
    showNone: true,
    colors: () => [],
    opacityValues: () => [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    title: '',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const isOpen = ref(false);

// Generate color options with "None" option if enabled
const colorOptions = computed<ColorOption[]>(() => {
  const options: ColorOption[] = [];

  if (props.showNone) {
    options.push({
      name: 'None',
      value: '',
      hex: 'transparent',
    });
  }

  options.push(...props.colors);

  return options;
});

// Parse current value to extract color and opacity
const currentColor = computed(() => {
  if (!props.modelValue) return null;
  // Remove opacity suffix (e.g., 'text-red-500/50' -> 'text-red-500')
  return props.modelValue.replace(/\/\d+$/, '');
});

const currentOpacity = computed(() => {
  if (!props.modelValue) return null;
  const match = props.modelValue.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
});

const selectedColorName = computed(() => {
  if (!currentColor.value) return 'None';
  const option = colorOptions.value.find((opt) => opt.value === currentColor.value);
  return option?.name || currentColor.value;
});

// Update value
const updateColor = (colorValue: string) => {
  const opacity = currentOpacity.value ? `/${currentOpacity.value}` : '';
  const newValue = colorValue ? `${colorValue}${opacity}` : '';
  emit('update:modelValue', newValue);
  emit('change', newValue);
  isOpen.value = false;
};

const updateOpacity = (opacity: number | null) => {
  if (!currentColor.value && opacity !== null) return; // Can't set opacity without color
  const newValue = currentColor.value && opacity !== null ? `${currentColor.value}/${opacity}` : currentColor.value || '';
  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// Get preview color from option or use a default
const getPreviewColor = (option: ColorOption): string => {
  if (option.hex) return option.hex;
  // Try to extract color from value (e.g., 'text-red-500' -> 'red-500')
  const match = option.value.match(/(?:text|bg|border)-(.+)/);
  if (match) {
    // This is a simplified fallback - in production, you'd use Tailwind config
    return '#6b7280'; // Default gray
  }
  return '#6b7280';
};

const colorPickerTrigger = tv({
  base: 'flex items-center gap-1.5 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-zinc-900',
  variants: {
    size: {
      xs: 'px-2 py-0.5 text-[10px]',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    },
    open: {
      true: 'bg-zinc-800 border-indigo-500 text-gray-200',
      false: 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-zinc-600',
    },
  },
  defaultVariants: {
    size: 'sm',
    open: false,
  },
});

const colorPickerSelect = tv({
  base: 'rounded border bg-zinc-800 border-zinc-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-zinc-900',
  variants: {
    size: {
      xs: 'px-2 py-0.5 text-[10px]',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

const colorButton = tv({
  base: 'aspect-square rounded border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500',
  variants: {
    selected: {
      true: 'ring-2 ring-indigo-500 border-indigo-400',
      false: 'border-zinc-700 hover:border-zinc-600',
    },
  },
  defaultVariants: {
    selected: false,
  },
});

const colorPickerRef = ref<HTMLElement | null>(null);

// Close on outside click
onClickOutside(colorPickerRef, () => {
  isOpen.value = false;
});

// Close on Escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<template>
  <div ref="colorPickerRef" class="flex items-center gap-1">
    <!-- Color Picker -->
    <div class="relative inline-block">
      <button
        type="button"
        :class="colorPickerTrigger({ size, open: isOpen })"
        @click="isOpen = !isOpen"
      >
        <slot name="preview" :selected="colorOptions.find(opt => opt.value === currentColor)">
          <div
            v-if="currentColor"
            class="w-3 h-3 rounded border border-zinc-600"
            :style="{
              backgroundColor: getPreviewColor(colorOptions.find(opt => opt.value === currentColor) || { name: '', value: currentColor }),
            }"
          />
        </slot>
        <span class="text-[10px] uppercase font-medium">{{ selectedColorName }}</span>
        <UIcon
          name="ChevronDown"
          class="w-3 h-3 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </button>

      <!-- Dropdown Menu -->
      <Transition
        enter-active-class="transition-all duration-150 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition-all duration-100 ease-in"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-1"
      >
        <div
          v-if="isOpen"
          class="absolute z-50 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
          style="min-width: 200px; max-width: 300px;"
        >
          <div v-if="title" class="px-3 py-2 border-b border-zinc-700">
            <span class="text-xs font-medium text-gray-300 uppercase tracking-wide">{{ title }}</span>
          </div>
          <slot name="colors" :colors="colorOptions" :current-color="currentColor" :on-select="updateColor">
            <!-- Default color grid if no slot provided -->
            <div class="p-2 max-h-80 overflow-y-auto">
              <div v-if="colorOptions.length > 0" class="grid grid-cols-6 gap-1.5">
                <button
                  v-for="option in colorOptions"
                  :key="option.value"
                  type="button"
                  :class="colorButton({ selected: currentColor === option.value })"
                  :style="{
                    backgroundColor: getPreviewColor(option),
                  }"
                  :title="option.name"
                  @click="updateColor(option.value)"
                />
              </div>
              <div v-else class="px-3 py-2 text-sm text-zinc-500 text-center">
                No colors available
              </div>
            </div>
          </slot>
        </div>
      </Transition>
    </div>

    <!-- Opacity Picker (if enabled and color is selected) -->
    <select
      v-if="showOpacity && currentColor && opacityValues.length > 0"
      :value="currentOpacity?.toString() || '100'"
      :class="colorPickerSelect({ size })"
      @change="updateOpacity(parseInt(($event.target as HTMLSelectElement).value, 10))"
    >
      <option v-for="opacity in opacityValues" :key="opacity" :value="opacity">
        {{ opacity }}%
      </option>
    </select>
  </div>
</template>
