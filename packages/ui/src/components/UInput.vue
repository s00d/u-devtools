<script setup lang="ts">
import { computed, useSlots } from 'vue';
import UIcon from './UIcon.vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    placeholder?: string;
    type?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    disabled?: boolean;
    readonly?: boolean;
    // Префикс/суффикс (текст или иконка)
    prefix?: string; // Текст префикса
    suffix?: string; // Текст суффикса
    prefixIcon?: string; // Иконка префикса (Heroicons name)
    suffixIcon?: string; // Иконка суффикса (Heroicons name)
    // Встроенный текст в начале/конце
    prepend?: string; // Текст перед input (внешний)
    append?: string; // Текст после input (внешний)
  }>(),
  {
    size: 'md',
    disabled: false,
    readonly: false,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  keydown: [event: KeyboardEvent];
  keyup: [event: KeyboardEvent];
  enter: [event: KeyboardEvent];
}>();

const slots = useSlots();

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-5 py-2.5 text-lg',
  };
  return sizes[props.size];
});

const inputPaddingClasses = computed(() => {
  // Padding управляется через классы в template (pl-8/pr-8 для prefix/suffix)
  return '';
});

const hasPrefix = computed(() => props.prefix || props.prefixIcon || !!slots.prefix);
const hasSuffix = computed(() => props.suffix || props.suffixIcon || !!slots.suffix);
const hasPrepend = computed(() => props.prepend || !!slots.prepend);
const hasAppend = computed(() => props.append || !!slots.append);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    emit('enter', e);
  }
  emit('keydown', e);
};

const prependSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  return sizes[props.size];
});

const appendSizeClasses = computed(() => {
  const sizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };
  return sizes[props.size];
});

const inputBorderRadiusClasses = computed(() => {
  const classes: string[] = [];

  if (hasPrefix.value && !hasPrepend.value) {
    classes.push('rounded-l-none');
  }
  if (hasSuffix.value && !hasAppend.value) {
    classes.push('rounded-r-none');
  }
  if (hasPrepend.value) {
    classes.push('rounded-l-none');
  }
  if (hasAppend.value) {
    classes.push('rounded-r-none');
  }

  return classes.join(' ');
});

const handleFocus = (e: FocusEvent) => {
  const target = e.currentTarget as HTMLInputElement | null;
  if (target) {
    target.style.borderColor = 'rgba(99, 102, 241, 0.5)';
    target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  }
  emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
  const target = e.currentTarget as HTMLInputElement | null;
  if (target) {
    target.style.borderColor = 'transparent';
    target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  }
  emit('blur', e);
};

const handleMouseEnter = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLInputElement | null;
  if (target && window.document.activeElement !== target) {
    target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
  }
};

const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLInputElement | null;
  if (target && window.document.activeElement !== target) {
    target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
  }
};
</script>

<template>
  <div class="udt-input-wrapper flex items-center w-full">
    <!-- Prepend (внешний текст слева) -->
    <div
      v-if="hasPrepend"
      class="udt-input-prepend flex items-center px-3 border border-r-0 rounded-l"
      :style="{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'var(--udt-text)'
      }"
      :class="prependSizeClasses"
    >
      <slot name="prepend">
        {{ prepend }}
      </slot>
    </div>

    <!-- Input container -->
    <div class="udt-input-container flex-1 relative">
      <!-- Prefix (внутренний текст/иконка слева) -->
      <div
        v-if="hasPrefix"
        class="udt-input-prefix absolute left-0 top-0 bottom-0 flex items-center justify-center text-gray-400 pointer-events-none z-10"
        :class="{
          'pl-2': !hasPrepend,
          'pl-3': hasPrepend,
        }"
      >
        <slot name="prefix">
          <UIcon v-if="prefixIcon" :name="prefixIcon" :class="size === 'xs' || size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'" />
          <span v-else-if="prefix" class="text-xs">{{ prefix }}</span>
        </slot>
      </div>

      <!-- Input field -->
      <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="[
          'udt-input w-full border border-transparent rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-indigo-500/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses,
          inputPaddingClasses,
          inputBorderRadiusClasses,
          hasPrefix ? (!hasPrepend ? 'pl-8' : 'pl-10') : '',
          hasSuffix ? (!hasAppend ? 'pr-8' : 'pr-10') : '',
        ]"
        :style="{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          color: 'var(--udt-text)',
          borderColor: 'transparent'
        }"
        @focus="handleFocus"
        @blur="handleBlur"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
        @keyup="emit('keyup', $event)"
      />

      <!-- Suffix (внутренний текст/иконка справа) -->
      <div
        v-if="hasSuffix"
        class="udt-input-suffix absolute right-0 top-0 bottom-0 flex items-center justify-center z-10"
        :class="{
          'pr-2': !hasAppend,
          'pr-3': hasAppend,
        }"
      >
        <slot name="suffix">
          <UIcon v-if="suffixIcon" :name="suffixIcon" :class="size === 'xs' || size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'" :style="{ color: 'var(--udt-text-dim)' }" />
          <span v-else-if="suffix" class="text-xs" :style="{ color: 'var(--udt-text-dim)' }">{{ suffix }}</span>
        </slot>
      </div>
    </div>

    <!-- Append (внешний текст справа) -->
    <div
      v-if="hasAppend"
      class="udt-input-append flex items-center px-3 border border-l-0 rounded-r"
      :style="{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        color: 'var(--udt-text)'
      }"
      :class="appendSizeClasses"
    >
      <slot name="append">
        {{ append }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>
