<script setup lang="ts">
import { computed } from 'vue';
import { tv } from 'tailwind-variants';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    rows?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  }>(),
  {
    modelValue: '',
    placeholder: '',
    disabled: false,
    readonly: false,
    rows: 4,
    resize: 'vertical',
    size: 'md',
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
}>();

const textarea = tv({
  base: [
    'w-full border border-transparent rounded-lg transition-all duration-200',
    'bg-black/20 text-gray-200',
    'focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:bg-black/40',
    'hover:bg-black/40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'readonly:bg-black/10 readonly:cursor-default',
  ],
  variants: {
    size: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-2.5 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-2.5 text-base',
      xl: 'px-5 py-3 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const textareaClass = computed(() => {
  const resizeClass = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  }[props.resize];

  return textarea({ size: props.size }) + ' ' + resizeClass;
});

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :class="textareaClass"
    @input="handleInput"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  />
</template>

