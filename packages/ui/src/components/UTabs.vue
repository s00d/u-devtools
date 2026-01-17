<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { tv } from 'tailwind-variants';
import UIcon from './UIcon.vue';

const props = withDefaults(
  defineProps<{
    items: string[];
    modelValue?: string;
    maxVisible?: number; // Maximum number of visible tabs
  }>(),
  {
    maxVisible: undefined,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const showMoreMenu = ref(false);

const visibleTabs = computed(() => {
  if (props.maxVisible === undefined || props.items.length <= props.maxVisible) {
    return props.items;
  }
  return props.items.slice(0, props.maxVisible);
});

const hiddenTabs = computed(() => {
  if (props.maxVisible === undefined || props.items.length <= props.maxVisible) {
    return [];
  }
  return props.items.slice(props.maxVisible);
});

// Close menu on outside click
onMounted(() => {
  if (hiddenTabs.value.length === 0) return;

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.tabs-dropdown-container')) {
      showMoreMenu.value = false;
    }
  };
  document.addEventListener('click', handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});

const tabButton = tv({
  base: 'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 relative z-10',
  variants: {
    active: {
      true: 'text-white bg-zinc-800 shadow-sm',
      false: 'text-gray-400 hover:text-gray-200 hover:bg-white/5',
    },
  },
  defaultVariants: {
    active: false,
  },
});

const dropdownOption = tv({
  base: 'w-full text-left px-4 py-2 text-sm transition-colors',
  variants: {
    active: {
      true: 'bg-indigo-900/30 text-indigo-300',
      false: 'text-gray-300 hover:bg-gray-700',
    },
  },
  defaultVariants: {
    active: false,
  },
});
</script>

<template>
  <div 
    class="flex gap-1 p-1 rounded-lg border bg-zinc-900/50 border-zinc-800 tabs-dropdown-container"
  >
    <!-- Visible tabs -->
    <button
      v-for="item in visibleTabs"
      :key="item"
      @click="emit('update:modelValue', item)"
      :class="tabButton({ active: modelValue === item })"
    >
      {{ item }}
    </button>
    
    <!-- "..." button for hidden tabs -->
    <div v-if="hiddenTabs.length > 0" class="relative">
      <button
        @click.stop="showMoreMenu = !showMoreMenu"
        :class="tabButton({ active: hiddenTabs.includes(modelValue || '') })"
      >
        <UIcon name="EllipsisHorizontal" class="w-4 h-4" />
      </button>
      
      <!-- Dropdown menu -->
      <div
        v-if="showMoreMenu"
        class="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-[180px]"
        @click.stop
      >
        <div class="py-1">
          <button
            v-for="item in hiddenTabs"
            :key="item"
            @click="emit('update:modelValue', item); showMoreMenu = false"
            :class="dropdownOption({ active: modelValue === item })"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

