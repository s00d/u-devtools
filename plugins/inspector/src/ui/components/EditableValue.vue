<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps<{
  value: string;
  prop: string;
}>();

const emit = defineEmits<{
  (e: 'update', payload: { prop: string; value: string }): void;
}>();

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const tempValue = ref('');

const startEdit = async () => {
  tempValue.value = props.value;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
};

const save = () => {
  if (!isEditing.value) return;
  if (tempValue.value.trim() !== props.value) {
    emit('update', { prop: props.prop, value: tempValue.value.trim() });
  }
  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
};
</script>

<template>
  <div 
    class="relative cursor-text font-mono text-xs text-gray-200 hover:text-indigo-400 transition-colors"
    title="Double click to edit"
  >
    <span 
      v-if="!isEditing"
      @dblclick.stop="startEdit"
      class="truncate select-all block"
    >
      {{ value }}
    </span>
    <input
      v-else
      ref="inputRef"
      v-model="tempValue"
      @blur="save"
      @keydown.enter="save"
      @keydown.esc="cancel"
      @click.stop
      @mousedown.stop
      class="absolute inset-0 w-full bg-gray-800 text-gray-200 border border-indigo-500 rounded px-2 py-0.5 outline-none z-50"
    />
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

