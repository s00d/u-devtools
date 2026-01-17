<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';
import type { DropdownOption } from '../types';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options?: DropdownOption[];
    placeholder?: string;
    size?: 'xs' | 'sm' | 'md';
    disabled?: boolean;
    /**
     * Custom trigger slot
     */
    trigger?: 'button' | 'custom';
  }>(),
  {
    size: 'sm',
    disabled: false,
    trigger: 'button',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  change: [value: string];
}>();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const selectedOption = computed(() => {
  return props.options?.find((opt) => opt.value === props.modelValue);
});

const dropdownTrigger = tv({
  base: 'flex items-center gap-1.5 rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-zinc-900',
  variants: {
    size: {
      xs: 'px-2 py-0.5 text-[10px]',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    },
    disabled: {
      true: 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed border-zinc-800',
      false: '',
    },
    open: {
      true: 'bg-zinc-800 border-indigo-500 text-gray-200',
      false: 'bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700 hover:border-zinc-600',
    },
  },
  defaultVariants: {
    size: 'sm',
    disabled: false,
    open: false,
  },
});

const dropdownOption = tv({
  base: 'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
  variants: {
    disabled: {
      true: 'text-zinc-600 cursor-not-allowed',
      false: '',
    },
    selected: {
      true: 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30',
      false: 'text-gray-300 hover:bg-zinc-700 hover:text-white',
    },
  },
  defaultVariants: {
    disabled: false,
    selected: false,
  },
});

const toggle = () => {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
};

const select = (value: string) => {
  if (props.disabled) return;
  emit('update:modelValue', value);
  emit('change', value);
  isOpen.value = false;
};

// Close on outside click
onClickOutside(dropdownRef, () => {
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
  <div ref="dropdownRef" class="relative inline-block">
    <!-- Trigger -->
    <button
      v-if="trigger === 'button'"
      type="button"
      :class="dropdownTrigger({ size, disabled: props.disabled, open: isOpen })"
      @click="toggle"
    >
      <slot name="trigger" :selected="selectedOption" :isOpen="isOpen">
        <span v-if="selectedOption" class="flex items-center gap-1.5">
          <slot name="preview" :selected="selectedOption">
            <UIcon v-if="selectedOption.icon" :name="selectedOption.icon" class="w-3.5 h-3.5" />
          </slot>
          {{ selectedOption.label }}
        </span>
        <span v-else class="text-zinc-500">{{ placeholder || 'Select...' }}</span>
        <UIcon
          name="ChevronDown"
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </slot>
    </button>

    <div v-else @click="toggle">
      <slot name="trigger" :selected="selectedOption" :isOpen="isOpen" />
    </div>

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
        class="absolute z-50 mt-1 min-w-[120px] max-w-[280px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
        :class="{
          'left-0': true,
          'right-0': false,
        }"
      >
        <div class="max-h-64 overflow-y-auto">
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            :disabled="option.disabled"
            :class="dropdownOption({ disabled: option.disabled, selected: option.value === modelValue })"
            @click="select(option.value)"
          >
            <UIcon v-if="option.icon" :name="option.icon" class="w-4 h-4 shrink-0" />
            <span class="flex-1 truncate">{{ option.label }}</span>
            <UIcon
              v-if="option.value === modelValue"
              name="Check"
              class="w-4 h-4 shrink-0 text-indigo-400"
            />
          </button>
          <div v-if="!options || options.length === 0" class="px-3 py-2 text-sm text-zinc-500">
            No options
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

