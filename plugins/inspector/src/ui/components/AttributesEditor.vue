<script setup lang="ts">
import { ref } from 'vue';
import { UInput, UButton, UIcon, UKeyValue } from '@u-devtools/ui';

defineProps<{
  attrs: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update', payload: { name: string; value: string }): void;
  (e: 'delete', name: string): void;
  (e: 'add', payload: { name: string; value: string }): void;
}>();

const newAttrKey = ref('');
const newAttrValue = ref('');

const updateAttr = (name: string, value: string) => {
  emit('update', { name, value });
};

const deleteAttr = (name: string) => {
  emit('delete', name);
};

const addAttr = () => {
  if (!newAttrKey.value.trim()) return;
  emit('add', { name: newAttrKey.value.trim(), value: newAttrValue.value.trim() });
  newAttrKey.value = '';
  newAttrValue.value = '';
};
</script>

<template>
  <div>
    <div class="text-xs font-bold text-gray-400 uppercase mb-3">Attributes</div>
    <div class="space-y-2 border-t border-gray-800 pt-3">
      <div 
        v-for="(val, key) in attrs" 
        :key="key" 
        class="grid grid-cols-[1fr_2fr_24px] gap-3 items-center text-sm group py-1"
      >
        <span 
          class="font-mono text-indigo-400 truncate" 
          :title="key"
        >
          {{ key }}
        </span>
        <input 
          :value="val" 
          @change="(e: any) => updateAttr(key, e.target.value)" 
          class="bg-gray-800/50 border-b border-dashed border-gray-700 focus:border-indigo-500 outline-none w-full truncate font-mono text-gray-200 text-sm px-1 py-0.5 rounded-t" 
        />
        <button 
          @click="deleteAttr(key)" 
          class="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition p-1"
        >
          <UIcon name="XMark" class="w-4 h-4"/>
        </button>
      </div>
      
      <!-- Add New Attr -->
      <div class="grid grid-cols-[1fr_2fr_24px] gap-3 items-center text-sm pt-3 border-t border-gray-800">
        <UInput 
          v-model="newAttrKey" 
          placeholder="name" 
          size="sm"
        />
        <UInput 
          v-model="newAttrValue" 
          placeholder="value"
          size="sm" 
          @keydown.enter="addAttr"
          class="text-sm"
        />
        <button 
          @click="addAttr" 
          class="text-green-400 hover:text-green-500 transition p-1"
        >
          <UIcon name="Plus" class="w-4 h-4"/>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

