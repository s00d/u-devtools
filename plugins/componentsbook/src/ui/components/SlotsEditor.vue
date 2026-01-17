<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SlotMeta } from '../../types';

const props = defineProps<{
  slotsMeta: SlotMeta[];
  modelValue: Record<string, string>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, string>];
}>();

const localSlots = ref({ ...props.modelValue });

watch(localSlots, (newVal) => {
  emit('update:modelValue', { ...newVal });
}, { deep: true });
</script>

<template>
  <div class="space-y-4">
    <div v-for="slot in slotsMeta" :key="slot.name" class="space-y-1">
      <div class="flex justify-between items-center">
        <label class="text-sm font-semibold text-gray-300">#{{ slot.name }}</label>
        <span v-if="slot.description" class="text-[10px] text-gray-500">{{ slot.description }}</span>
      </div>
      <textarea
        v-model="localSlots[slot.name]"
        class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs font-mono text-gray-300 focus:border-indigo-500 outline-none h-20 resize-y"
        placeholder="Enter HTML or text content..."
      ></textarea>
      <div v-if="slot.bindings" class="text-[10px] text-indigo-400 font-mono">
        Props: {{ slot.bindings }}
      </div>
    </div>
    
    <div v-if="slotsMeta.length === 0" class="text-center text-gray-500 py-4 text-sm">
      No slots detected
    </div>
  </div>
</template>
