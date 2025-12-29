<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  value: string;
  prop: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}>();

const emit = defineEmits<{
  (e: 'update', payload: { prop: string; value: string }): void;
}>();

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const tempValue = ref('');

// Форматирование для отображения (убираем px, если это 0 или -)
const displayValue = computed(() => {
  const v = props.value;
  if (!v || v === '0px' || v === '0') return '-';
  return parseFloat(v);
});

const startEdit = async () => {
  tempValue.value = props.value === '0px' ? '0' : props.value;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
};

const save = () => {
  if (!isEditing.value) return;
  
  let val = tempValue.value.trim();
  
  // Если ввели число без единиц измерения, добавляем px
  if (val && !isNaN(Number(val))) {
    val += 'px';
  }

  if (val !== props.value) {
    emit('update', { prop: props.prop, value: val });
  }
  
  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
};

// Функции для изменения значения через кнопки
const adjustValue = (delta: number) => {
  const current = parseFloat(props.value) || 0;
  const unit = props.value.includes('px') ? 'px' : (props.value.includes('em') ? 'em' : (props.value.includes('rem') ? 'rem' : 'px'));
  const newValue = Math.max(0, current + delta);
  emit('update', { prop: props.prop, value: `${newValue}${unit}` });
};

const increment = () => adjustValue(1);
const decrement = () => adjustValue(-1);
</script>

<template>
  <div 
    class="boxvalue-container relative min-w-[24px] h-[14px] flex items-center justify-center"
    title="Double click to edit"
  >
    <!-- Кнопки для вертикальных позиций (left, right) - кнопки по вертикали (сверху и снизу) -->
    <template v-if="position === 'left' || position === 'right'">
      <button
        @click.stop="increment"
        class="boxvalue-btn absolute left-1/2 -translate-x-1/2 -top-2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Increase"
      >
        <UIcon name="Plus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
      <button
        @click.stop="decrement"
        class="boxvalue-btn absolute left-1/2 -translate-x-1/2 -bottom-2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Decrease"
      >
        <UIcon name="Minus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
    </template>
    
    <!-- Кнопки для горизонтальных позиций (top, bottom) - кнопки по горизонтали (слева и справа) -->
    <template v-else-if="position === 'top' || position === 'bottom'">
      <button
        @click.stop="decrement"
        class="boxvalue-btn absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Decrease"
      >
        <UIcon name="Minus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
      <button
        @click.stop="increment"
        class="boxvalue-btn absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Increase"
      >
        <UIcon name="Plus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
    </template>
    
    <!-- Кнопки для центральной позиции (width, height) - обе кнопки по горизонтали -->
    <template v-else>
      <button
        @click.stop="decrement"
        class="boxvalue-btn absolute -left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Decrease"
      >
        <UIcon name="Minus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
      <button
        @click.stop="increment"
        class="boxvalue-btn absolute -right-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 flex items-center justify-center hover:bg-gray-800/50 rounded transition-opacity z-20"
        title="Increase"
      >
        <UIcon name="Plus" class="w-1.5 h-1.5 text-gray-400" />
      </button>
    </template>
    
    <!-- Значение -->
    <div 
      @dblclick.stop="startEdit" 
      class="cursor-text truncate max-w-[40px] z-10 relative"
    >
      <span v-if="!isEditing">{{ displayValue }}</span>
      <input
        v-else
        ref="inputRef"
        v-model="tempValue"
        @blur="save"
        @keydown.enter="save"
        @keydown.esc="cancel"
        class="absolute inset-0 w-full h-full text-center bg-white dark:bg-gray-800 text-black dark:text-white border border-indigo-500 rounded text-[10px] outline-none z-30"
      />
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.boxvalue-container .boxvalue-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.boxvalue-container:hover .boxvalue-btn {
  opacity: 1;
  pointer-events: auto;
}

.boxvalue-container:not(:hover) .boxvalue-btn {
  opacity: 0;
  pointer-events: none;
}
</style>

