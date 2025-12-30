<script setup lang="ts">
import { computed } from 'vue';
import { useVirtualList } from '@vueuse/core';

export interface VirtualListProps<T = unknown> {
  items: T[];
  itemHeight?: number;
  overscan?: number;
  keyField?: string | ((item: T) => string | number);
}

const props = withDefaults(defineProps<VirtualListProps>(), {
  itemHeight: 50,
  overscan: 5,
  keyField: undefined,
});

const emit = defineEmits<(e: 'scroll', event: Event) => void>();

// Вычисляем key для элемента
const getItemKey = (item: unknown, index: number): string | number => {
  if (props.keyField) {
    if (typeof props.keyField === 'function') {
      return props.keyField(item as never);
    }
    return (item as Record<string, unknown>)[props.keyField] as string | number;
  }
  return index;
};

// Создаем виртуальный список с помощью vueuse
const { list, containerProps, wrapperProps } = useVirtualList(
  computed(() => props.items),
  {
    itemHeight: props.itemHeight,
    overscan: props.overscan,
  }
);

// Обработка скролла для emit события
const handleScroll = (e: Event) => {
  emit('scroll', e);
};
</script>

<template>
  <div
    v-bind="containerProps"
    class="h-full overflow-auto"
    @scroll="handleScroll"
  >
    <div v-bind="wrapperProps">
      <div
        v-for="{ data: item, index } in list"
        :key="getItemKey(item, index)"
      >
        <slot :item="item" :index="index" />
      </div>
    </div>
    
    <div v-if="items.length === 0" class="p-4 text-center text-gray-400 text-sm">
      <slot name="empty">
        No items
      </slot>
    </div>
  </div>
</template>
