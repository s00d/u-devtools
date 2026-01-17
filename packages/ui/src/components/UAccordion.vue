<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';

const props = withDefaults(
  defineProps<{
    title: string;
    defaultOpen?: boolean;
    /**
     * Controlled open state (use with v-model:open)
     */
    open?: boolean;
    /**
     * Variant style
     */
    variant?: 'default' | 'bordered' | 'ghost';
  }>(),
  {
    defaultOpen: false,
    variant: 'bordered',
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
}>();

// Use controlled state if provided, otherwise use internal state
const isControlled = props.open !== undefined;
const internalOpen = ref(props.defaultOpen);

const isOpen = computed(() => {
  return isControlled ? props.open : internalOpen.value;
});

const toggle = () => {
  const newValue = !isOpen.value;
  if (!isControlled) {
    internalOpen.value = newValue;
  }
  emit('update:open', newValue);
};

// Watch for external changes to defaultOpen
watch(() => props.defaultOpen, (newVal) => {
  if (!isControlled) {
    internalOpen.value = newVal;
  }
});

const accordion = tv({
  base: '',
  variants: {
    variant: {
      bordered: 'border-b border-zinc-800',
      default: 'border border-zinc-800 rounded-lg',
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'bordered',
  },
});

const accordionButton = tv({
  base: 'w-full px-3 py-2 flex items-center justify-between text-left hover:bg-zinc-800/50 transition-colors',
  variants: {
    variant: {
      default: '',
      bordered: '',
      ghost: '',
    },
    open: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      open: true,
      class: 'rounded-t-lg',
    },
    {
      variant: 'default',
      open: false,
      class: 'rounded-lg',
    },
  ],
  defaultVariants: {
    variant: 'bordered',
    open: false,
  },
});

const accordionContent = tv({
  base: 'overflow-hidden',
  variants: {
    variant: {
      bordered: 'border-t border-zinc-800',
      default: 'border-t border-zinc-800',
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'bordered',
  },
});
</script>


<template>
  <div :class="accordion({ variant })">
    <button
      @click="toggle"
      :class="accordionButton({ variant, open: isOpen })"
    >
      <span class="text-sm font-medium text-gray-200">{{ title }}</span>
      <UIcon
        :name="isOpen ? 'ChevronDown' : 'ChevronRight'"
        class="w-4 h-4 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-90': isOpen }"
      />
    </button>
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-[2000px]"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-[2000px]"
      leave-to-class="opacity-0 max-h-0"
    >
      <div
        v-if="isOpen"
        :class="accordionContent({ variant })"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

