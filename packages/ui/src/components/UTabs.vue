<script setup lang="ts">
defineProps<{
  items: string[];
  modelValue?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const handleTabMouseEnter = (e: MouseEvent, item: string, modelValue?: string) => {
  if (modelValue !== item) {
    const target = e.currentTarget as HTMLButtonElement | null;
    if (target) {
      target.style.color = 'var(--udt-text)';
      target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
  }
};

const handleTabMouseLeave = (e: MouseEvent, item: string, modelValue?: string) => {
  if (modelValue !== item) {
    const target = e.currentTarget as HTMLButtonElement | null;
    if (target) {
      target.style.color = 'var(--udt-text-dim)';
      target.style.backgroundColor = 'transparent';
    }
  }
};
</script>

<template>
  <div 
    class="flex gap-1 p-1 rounded-lg border"
    :style="{
      backgroundColor: 'rgba(18, 18, 20, 0.5)',
      borderColor: 'var(--udt-border)'
    }"
  >
    <button
      v-for="item in items"
      :key="item"
      @click="$emit('update:modelValue', item)"
      class="px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 relative z-10"
      :style="modelValue === item
        ? {
            color: 'white',
            backgroundColor: 'var(--udt-bg-hover)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
          }
        : {
            color: 'var(--udt-text-dim)'
          }"
      @mouseenter="(e) => handleTabMouseEnter(e, item, modelValue)"
      @mouseleave="(e) => handleTabMouseLeave(e, item, modelValue)"
    >
      {{ item }}
    </button>
  </div>
</template>

