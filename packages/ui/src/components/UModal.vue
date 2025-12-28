<script setup lang="ts">
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
        <div
          v-if="title"
          class="p-4 border-b dark:border-gray-700 font-bold text-lg flex justify-between items-center"
        >
          <span class="dark:text-white">{{ title }}</span>
          <button
            @click="$emit('close')"
            class="i-carbon-close text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition"
          />
        </div>
        <div class="p-6 overflow-auto flex-1">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

