<script setup lang="ts">
import { computed } from 'vue';
import UIcon from './UIcon.vue';

const props = withDefaults(
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

defineEmits<{
  close: [];
}>();

defineSlots<{
  default(): unknown;
}>();

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-[600px]',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[calc(100vw-2rem)] w-full',
  };
  return sizes[props.size];
});

const titleSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    full: 'text-xl',
  };
  return sizes[props.size];
});

const paddingClasses = computed(() => {
  const sizes = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
    full: 'p-6',
  };
  return sizes[props.size];
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="closable && $emit('close')"
    >
      <div
        :class="[
          'bg-gray-800 rounded-lg shadow-xl w-full max-h-[calc(100vh-2rem)] flex flex-col',
          sizeClasses,
        ]"
      >
        <div
          v-if="title || closable"
          :class="[
            'border-b border-gray-700 font-bold flex justify-between items-center flex-shrink-0',
            paddingClasses,
            titleSizeClasses,
          ]"
        >
          <span v-if="title" class="text-white">{{ title }}</span>
          <span v-else class="flex-1"></span>
          <button
            v-if="closable"
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition ml-auto"
          >
            <UIcon name="XMark" class="w-5 h-5" />
          </button>
        </div>
        <div :class="['overflow-auto flex-1 min-h-0', paddingClasses]">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
