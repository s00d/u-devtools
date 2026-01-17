<script setup lang="ts">
import { computed, useSlots } from 'vue';
import { tv } from 'tailwind-variants';
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

const input = tv({
  base: 'w-full border border-transparent rounded-lg transition-all duration-200 bg-black/20 text-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:bg-black/40 hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    size: {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-5 py-2.5 text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const prependAppend = tv({
  base: 'flex items-center border border-white/10 bg-black/30 text-gray-200',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const inputIcon = tv({
  base: 'text-gray-400',
  variants: {
    size: {
      xs: 'w-4 h-4',
      sm: 'w-4 h-4',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
      xl: 'w-5 h-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
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
</script>

<template>
  <div class="flex items-center w-full">
      <!-- Prepend (внешний текст слева) -->
    <div
      v-if="hasPrepend"
      :class="[prependAppend({ size }), 'px-3 border-r-0 rounded-l']"
    >
      <slot name="prepend">
        {{ prepend }}
      </slot>
    </div>

    <!-- Input container -->
    <div class="flex-1 relative">
      <!-- Prefix (внутренний текст/иконка слева) -->
      <div
        v-if="hasPrefix"
        class="absolute left-0 top-0 bottom-0 flex items-center justify-center text-gray-400 pointer-events-none z-10"
        :class="{
          'pl-2': !hasPrepend,
          'pl-3': hasPrepend,
        }"
      >
        <slot name="prefix">
          <UIcon v-if="prefixIcon" :name="prefixIcon" :class="inputIcon({ size })" />
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
          input({ size }),
          inputBorderRadiusClasses,
          hasPrefix ? (!hasPrepend ? 'pl-8' : 'pl-10') : '',
          hasSuffix ? (!hasAppend ? 'pr-8' : 'pr-10') : '',
        ]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown="handleKeydown"
        @keyup="emit('keyup', $event)"
      />

      <!-- Suffix (внутренний текст/иконка справа) -->
      <div
        v-if="hasSuffix"
        class="absolute right-0 top-0 bottom-0 flex items-center justify-center z-10"
        :class="{
          'pr-2': !hasAppend,
          'pr-3': hasAppend,
        }"
      >
        <slot name="suffix">
          <UIcon v-if="suffixIcon" :name="suffixIcon" :class="inputIcon({ size })" />
          <span v-else-if="suffix" class="text-xs text-gray-400">{{ suffix }}</span>
        </slot>
      </div>
    </div>

    <!-- Append (внешний текст справа) -->
    <div
      v-if="hasAppend"
      :class="[prependAppend({ size }), 'px-3 border-l-0 rounded-r']"
    >
      <slot name="append">
        {{ append }}
      </slot>
    </div>
  </div>
</template>
