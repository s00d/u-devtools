<script setup lang="ts">
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';

// Disable attribute inheritance for teleport root
defineOptions({
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
  }>(),
  {
    size: 'md',
    closable: true,
  }
);

const emit = defineEmits<{
  close: [];
  'update:visible': [value: boolean];
}>();

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

defineSlots<{
  default(): unknown;
}>();

const modal = tv({
  base: 'bg-gray-800 rounded-lg shadow-xl w-full max-h-[calc(100vh-2rem)] flex flex-col',
  variants: {
    size: {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-[600px]',
      lg: 'max-w-4xl',
      xl: 'max-w-6xl',
      full: 'max-w-[calc(100vw-2rem)] w-full',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const modalHeader = tv({
  base: 'border-b border-gray-700 font-bold flex justify-between items-center flex-shrink-0',
  variants: {
    size: {
      xs: 'text-sm p-3',
      sm: 'text-base p-4',
      md: 'text-lg p-6',
      lg: 'text-xl p-8',
      xl: 'text-2xl p-10',
      full: 'text-xl p-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const modalContent = tv({
  base: 'overflow-auto flex-1 min-h-0',
  variants: {
    size: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10',
      full: 'p-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="closable && handleClose()"
    >
      <div :class="modal({ size })">
        <div
          v-if="title || closable"
          :class="modalHeader({ size })"
        >
          <span v-if="title" class="text-white">{{ title }}</span>
          <span v-else class="flex-1"></span>
          <button
            v-if="closable"
            @click="handleClose()"
            class="text-gray-400 hover:text-white transition ml-auto"
          >
            <UIcon name="XMark" class="w-5 h-5" />
          </button>
        </div>
        <div :class="modalContent({ size })">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
