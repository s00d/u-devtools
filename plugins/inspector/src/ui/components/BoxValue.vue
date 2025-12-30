<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const props = defineProps<{
  value: string | number; // Значение из computed styles (обычно "10px" или "0px")
  prop: string; // Имя свойства (marginTop)
}>();

const emit = defineEmits<(e: 'update', payload: { prop: string; value: string }) => void>();

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const tempValue = ref('');

// Форматируем для отображения: "0px" -> "-" для чистоты
const displayValue = computed(() => {
  const v = String(props.value);
  if (!v || v === '0px' || v === '0') return '-';
  // Округляем дробные пиксели для красоты (20.454px -> 20.45)
  return v.replace(/(\d+\.\d{2})\d+px/, '$1');
});

const startEdit = async () => {
  // При редактировании показываем реальное значение, либо пустую строку если 0
  const val = String(props.value);
  tempValue.value = val === '0px' || val === '-' || val === '0' ? '' : val;
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
};

const save = () => {
  if (!isEditing.value) return;

  let val = tempValue.value.trim();

  // Умная обработка единиц измерения
  if (val !== '') {
    // Если ввели просто число (не 0), добавляем px
    if (!Number.isNaN(Number(val)) && val !== '0') {
      val += 'px';
    }
    // Если ввели 0, тоже добавляем px
    if (val === '0') {
      val = '0px';
    }
    // Если ввели auto, 50%, inherit и т.д. - оставляем как есть
  } else {
    // Если стерли всё, ставим 0px
    val = '0px';
  }

  // Эмитим только если значение изменилось
  if (val !== String(props.value)) {
    emit('update', { prop: props.prop, value: val });
  }

  isEditing.value = false;
};

const cancel = () => {
  isEditing.value = false;
};
</script>

<template>
  <div
    @dblclick.stop="startEdit"
    class="relative flex items-center justify-center min-w-[20px] h-4 cursor-text group"
    :title="`Change ${prop}`"
  >
    <!-- View Mode -->
    <span v-if="!isEditing" class="truncate max-w-[50px] hover:text-black dark:hover:text-white transition-colors duration-200">
      {{ displayValue }}
    </span>

    <!-- Edit Mode -->
      <input
        v-else
        ref="inputRef"
        v-model="tempValue"
        @blur="save"
        @keydown.enter="save"
        @keydown.esc="cancel"
      class="absolute inset-0 w-full h-full text-center bg-white dark:bg-gray-800 text-black dark:text-white border border-indigo-500 rounded text-[10px] p-0 m-0 outline-none z-50 shadow-lg"
      />
  </div>
</template>
