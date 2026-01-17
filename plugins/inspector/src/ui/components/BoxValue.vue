<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

const props = defineProps<{
  value: string | number | undefined; // Value from computed styles (usually "10px" or "0px", can be undefined)
  prop: string; // Property name (marginTop)
}>();

const emit = defineEmits<(e: 'update', payload: { prop: string; value: string }) => void>();

const isEditing = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
const tempValue = ref('');

// Format for display: "0px" -> "-" for cleanliness
const displayValue = computed(() => {
  if (props.value === undefined || props.value === null) return '-';
  const v = String(props.value);
  if (!v || v === '0px' || v === '0') return '-';
  // Round fractional pixels for beauty (20.454px -> 20.45)
  return v.replace(/(\d+\.\d{2})\d+px/, '$1');
});

const startEdit = async () => {
  // When editing show real value, or empty string if 0 or undefined
  if (props.value === undefined || props.value === null) {
    tempValue.value = '';
  } else {
    const val = String(props.value);
    tempValue.value = val === '0px' || val === '-' || val === '0' ? '' : val;
  }
  isEditing.value = true;
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
};

const save = () => {
  if (!isEditing.value) return;

  let val = tempValue.value.trim();

  // Smart unit handling
  if (val !== '') {
    // If entered just number (not 0), add px
    if (!Number.isNaN(Number(val)) && val !== '0') {
      val += 'px';
    }
    // If entered 0, also add px
    if (val === '0') {
      val = '0px';
    }
    // If entered auto, 50%, inherit etc. - leave as is
  } else {
    // If cleared everything, set 0px
    val = '0px';
  }

  // Emit only if value changed
  const currentValue = props.value === undefined || props.value === null ? '' : String(props.value);
  if (val !== currentValue) {
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
    <span v-if="!isEditing" class="truncate max-w-[50px] hover:text-white transition-colors duration-200">
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
      class="absolute inset-0 w-full h-full text-center bg-gray-800 text-white border border-indigo-500 rounded text-[10px] p-0 m-0 outline-none z-50 shadow-lg"
      />
  </div>
</template>
