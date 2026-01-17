<script setup lang="ts">
import { computed, ref } from 'vue';
import { UInput } from '@u-devtools/ui';

const props = defineProps<{
  colors: Record<string, string | Record<string, string>>;
  onSelect: (cls: string) => void;
}>();

const search = ref('');
const mode = ref<'bg' | 'text' | 'border'>('bg');

// Flatten color tree into flat list
const flatColors = computed(() => {
  const list: { name: string; value: string; class: string }[] = [];

  Object.entries(props.colors).forEach(([name, val]) => {
    if (typeof val === 'string') {
      list.push({ name, value: val, class: `${mode.value}-${name}` });
    } else {
      Object.entries(val).forEach(([shade, hex]) => {
        list.push({
          name: `${name}-${shade}`,
          value: hex as string,
          class: `${mode.value}-${name}-${shade}`,
        });
      });
    }
  });

  if (search.value) {
    const query = search.value.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(query));
  }
  return list;
});
</script>

<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <UInput v-model="search" placeholder="Search color..." size="sm" class="flex-1" />
      <div class="flex bg-gray-800 rounded p-0.5 border border-gray-700">
        <button
          v-for="m in ['bg', 'text', 'border']"
          :key="m"
          @click="mode = m as 'bg' | 'text' | 'border'"
          class="px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors"
          :class="mode === m ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'"
        >
          {{ m }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
      <button
        v-for="c in flatColors"
        :key="c.name"
        @click="onSelect(c.class)"
        class="group relative w-full aspect-square rounded border border-gray-700/50 hover:scale-110 transition-transform focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        :style="{ backgroundColor: c.value }"
        :title="`${c.name} (${c.value})`"
      >
        <!-- Tooltip on hover -->
        <span
          class="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-black text-white text-[10px] rounded whitespace-nowrap pointer-events-none z-10"
        >
          {{ c.name }}
        </span>
      </button>
    </div>
  </div>
</template>

