<script setup lang="ts">
import { ref, computed } from 'vue';
import { UIcon } from '@u-devtools/ui';
import { findConflictingClasses } from '../../utils/conflicts';

const props = defineProps<{
  modelValue: string[];
  suggestions: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

const inputVal = ref('');
const showSuggestions = ref(false);

const filteredSuggestions = computed(() => {
  if (!inputVal.value) return [];
  const q = inputVal.value.toLowerCase();
  return props.suggestions
    .filter((s) => s.toLowerCase().startsWith(q) && !props.modelValue.includes(s))
    .slice(0, 20);
});

const addClass = (cls: string) => {
  const conflicts = findConflictingClasses(cls, props.modelValue);

  // Smart conflict removal
  const newClasses = props.modelValue.filter((c) => !conflicts.includes(c));
  newClasses.push(cls);

  emit('update:modelValue', newClasses);
  inputVal.value = '';
  showSuggestions.value = false;
};

const removeClass = (cls: string) => {
  emit(
    'update:modelValue',
    props.modelValue.filter((c) => c !== cls)
  );
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && inputVal.value) {
    e.preventDefault();
    addClass(inputVal.value);
  } else if (e.key === 'Backspace' && !inputVal.value && props.modelValue.length > 0) {
    removeClass(props.modelValue[props.modelValue.length - 1]);
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};
</script>

<template>
  <div class="relative">
    <div class="flex flex-wrap gap-2 p-2 bg-gray-900 border border-gray-700 rounded min-h-[42px]">
      <!-- Active Classes -->
      <div
        v-for="cls in modelValue"
        :key="cls"
        class="group flex items-center gap-1 bg-gray-800 text-gray-200 px-2 py-0.5 rounded text-xs font-mono border border-gray-700"
      >
        <span>{{ cls }}</span>
        <button @click="removeClass(cls)" class="text-gray-500 hover:text-red-400 transition-colors">
          <UIcon name="XMark" class="w-3 h-3" />
        </button>
      </div>

      <!-- Input -->
      <input
        v-model="inputVal"
        @focus="showSuggestions = true"
        @blur="handleBlur"
        @keydown="handleKeydown"
        class="bg-transparent outline-none text-sm text-white flex-1 min-w-[100px]"
        placeholder="Add class..."
      />
    </div>

    <!-- Autocomplete Dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute top-full left-0 w-full bg-gray-800 border border-gray-700 rounded-b shadow-xl max-h-[200px] overflow-auto z-50 mt-1"
    >
      <div
        v-for="s in filteredSuggestions"
        :key="s"
        @mousedown.prevent="addClass(s)"
        class="px-3 py-2 hover:bg-indigo-600 hover:text-white cursor-pointer text-sm font-mono text-gray-300 transition-colors"
      >
        {{ s }}
      </div>
    </div>
  </div>
</template>

