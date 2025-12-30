<script setup lang="ts">
defineProps<{
  items: string[];
  modelValue?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

</script>

<template>
  <div 
    class="flex gap-1 p-1 rounded-lg border bg-zinc-900/50 border-zinc-800"
  >
    <button
      v-for="item in items"
      :key="item"
      @click="$emit('update:modelValue', item)"
      class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 relative z-10"
      :class="modelValue === item
        ? 'text-white bg-zinc-800 shadow-sm'
        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'"
    >
      {{ item }}
    </button>
  </div>
</template>

