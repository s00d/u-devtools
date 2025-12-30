<script setup lang="ts">
import { computed } from 'vue';
import BoxModel from '../components/BoxModel.vue';
import EditableValue from '../components/EditableValue.vue';
import type { ElementInfo } from '../../composables/useElementData';

interface ComputedGroups {
  Layout?: Record<string, string>;
  Spacing?: Record<string, string>;
  Typography?: Record<string, string>;
  Background?: Record<string, string>;
  Border?: Record<string, string>;
}

const props = defineProps<{
  data: ElementInfo;
}>();

const emit = defineEmits<(e: 'update-style', payload: { prop: string; value: string }) => void>();

const computedGroups = computed<ComputedGroups>(() => {
  if (!props.data?.computed) return {};
  const s = props.data.computed;
  return {
    Layout: { 
      display: s.display, 
      position: s.position, 
      'box-sizing': s.boxSizing, 
      width: s.width, 
      height: s.height,
      'z-index': s.zIndex || '-'
    },
    Spacing: { 
      margin: s.margin || `${s.marginTop || 0} ${s.marginRight || 0} ${s.marginBottom || 0} ${s.marginLeft || 0}`, 
      padding: s.padding || `${s.paddingTop || 0} ${s.paddingRight || 0} ${s.paddingBottom || 0} ${s.paddingLeft || 0}` 
    },
    Typography: { 
      'font-family': s.fontFamily, 
      'font-size': s.fontSize, 
      color: s.color,
      'font-weight': s.fontWeight || '-',
      'line-height': s.lineHeight || '-'
    },
    Background: { 
      'background-color': s.backgroundColor || '-',
      'background': s.background || '-'
    },
    Border: {
      border: s.border || '-',
      'border-radius': s.borderRadius || '-'
    }
  };
});

const updateStyle = (payload: { prop: string; value: string }) => {
  emit('update-style', payload);
};
</script>

<template>
  <div class="p-4 space-y-4">
    <BoxModel v-if="data.computed" :styles="data.computed" @update="updateStyle" />
    
    <div v-for="(styles, group) in computedGroups" :key="group" class="border-t border-gray-800 pt-4 first:border-0 first:pt-0">
      <div class="border border-gray-800 rounded-lg bg-gray-800 overflow-hidden">
        <div class="border-b border-gray-800 bg-gray-800 px-4 py-2.5">
          <h3 class="font-semibold text-gray-200 text-xs uppercase">{{ group }}</h3>
        </div>
        <div class="p-4">
          <div class="space-y-1.5">
            <div 
              v-for="(val, key) in styles" 
              :key="key" 
              class="flex items-center gap-4 py-2 px-3 bg-gray-900/50 rounded border border-gray-800 hover:border-gray-700 transition-colors group"
            >
              <div class="text-gray-400 font-mono text-xs w-32 flex-shrink-0 truncate" :title="key">{{ key }}</div>
              <EditableValue 
                :value="String(val)" 
                :prop="key"
                @update="updateStyle"
                class="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

