<script setup lang="ts">
import UIcon from './UIcon.vue';

defineProps<{
  title: string;
  icon: string;
}>();
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon :name="icon" class="w-5 h-5" />
            {{ title }}
          </h2>
          <slot name="toolbar-left" />
        </div>
        <div class="flex items-center gap-2">
          <slot name="actions" />
        </div>
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 overflow-hidden relative">
      <slot />
    </div>
  </div>
</template>
