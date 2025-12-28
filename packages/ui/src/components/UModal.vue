<script setup lang="ts">
import UIcon from './UIcon.vue';

defineProps<{
  visible: boolean;
  title?: string;
}>();

defineEmits<{
  close: [];
}>();

defineSlots<{
  default(): unknown;
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-[600px] max-h-[calc(100vh-2rem)] flex flex-col">
        <div
          v-if="title"
          class="p-4 border-b border-gray-700 font-bold text-lg flex justify-between items-center flex-shrink-0"
        >
          <span class="text-white">{{ title }}</span>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-white transition"
          >
            <UIcon name="XMark" class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 overflow-auto flex-1 min-h-0">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

