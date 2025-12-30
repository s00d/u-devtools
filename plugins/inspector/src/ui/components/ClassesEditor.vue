<script setup lang="ts">
import { ref } from 'vue';
import { UInput, UButton, UIcon } from '@u-devtools/ui';

defineProps<{
  classes: string[];
}>();

const emit = defineEmits<{
  (e: 'add', cls: string): void;
  (e: 'remove', cls: string): void;
}>();

const newClass = ref('');

const addClass = () => {
  if (!newClass.value.trim()) return;
  emit('add', newClass.value.trim());
  newClass.value = '';
};

const removeClass = (cls: string) => {
  emit('remove', cls);
};
</script>

<template>
  <div>
    <div class="text-xs font-bold text-gray-400 uppercase mb-3">Classes</div>
    <div class="flex gap-2 mb-3">
      <UInput
        v-model="newClass"
        placeholder="Add class..."
        size="sm"
        class="flex-1"
        @keydown.enter="addClass"
      />
      <UButton size="sm" icon="Plus" @click="addClass" />
    </div>
    <div class="flex flex-wrap gap-1.5">
      <div
        v-for="cls in classes"
        :key="cls"
        class="group flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-800 rounded border border-gray-700 text-xs font-mono hover:border-gray-600 transition-colors"
      >
        <span class="text-green-400">.{{ cls }}</span>
        <button
          @click="removeClass(cls)"
          class="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-0.5"
        >
          <UIcon name="XMark" class="w-3 h-3"/>
        </button>
      </div>
      <div v-if="classes.length === 0" class="text-gray-500 text-sm italic py-2">No classes</div>
    </div>
  </div>
</template>
