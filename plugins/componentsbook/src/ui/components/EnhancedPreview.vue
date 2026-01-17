<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useEnhancedPreview } from '../composables/useEnhancedPreview';
import { useCanvasState } from '../composables/useCanvasState';
import { USplitter, UIcon } from '@u-devtools/ui';
import CanvasToolbar from './CanvasToolbar.vue';
import ActionLogger from './ActionLogger.vue';
import PreviewCodeBlock from './PreviewCodeBlock.vue';
import PropsEditor from './PropsEditor.vue';
import type { ComponentPropsMeta } from '../../types';
import SlotsEditor from './SlotsEditor.vue';
import MatrixView from './MatrixView.vue';
import UniversalRenderer from './UniversalRenderer.vue';
import type { ComponentMeta } from '../../types';

const props = withDefaults(
  defineProps<{
    title?: string;
    name?: string;
    component: any;        // Story Wrapper (экспорт default из файла .stories)
    targetComponent?: any; // Clean Component (экспорт const component)
    props?: Record<string, unknown>;
    emits?: string[];
    componentPropsMeta?: ComponentPropsMeta | null;
    meta?: ComponentMeta | null;
  }>(),
  {
    componentPropsMeta: null,
    meta: null,
    targetComponent: null,
    props: () => ({}),
  }
);

const emit = defineEmits<{
  'update:props': [props: Record<string, unknown>];
}>();

// --- STATE ---
type MainTab = 'Canvas' | 'Matrix' | 'Control';
const activeMainTab = ref<MainTab>('Canvas');
const activeSidebarTab = ref('Controls');

const { settings, setViewport, toggleRotate, zoomIn, zoomOut, resetZoom } = useCanvasState();
const localProps = ref({ ...props.props });
const slotContent = ref<Record<string, string>>({});

// --- LOGIC ---

// Для вкладки Control и Matrix: используем чистый компонент, если он есть
const componentToRender = computed(() => props.targetComponent || props.component);

const {
  isFrozen,
  toggleFreeze,
  generatedCode,
  actionLogs,
  clearLogs,
} = useEnhancedPreview(
  props,
  () => {},
  { fullVueFile: true, kebabCase: true }
);

// Sync Props
watch(() => props.props, (newVal) => { localProps.value = { ...newVal }; }, { deep: true, immediate: true });

const handlePropsUpdate = (newProps: Record<string, any>) => {
  localProps.value = newProps;
  emit('update:props', newProps);
};

// Canvas Styles
const canvasStyle = computed(() => ({
  transform: `scale(${settings.zoom})`,
  width: settings.viewport.width,
  height: settings.viewport.height,
  transition: 'width 0.3s, height 0.3s, transform 0.2s',
  marginTop: 'auto',
  marginBottom: 'auto',
  marginLeft: 'auto',
  marginRight: 'auto',
}));

const bgClass = computed(() => {
  switch (settings.background) {
    case 'light': return 'bg-white text-gray-900';
    case 'dark': return 'bg-gray-900 text-white';
    case 'grid': return 'bg-[radial-gradient(#374151_1px,transparent_1px)] bg-[length:20px_20px]';
    default: return '';
  }
});

const tabs: { id: MainTab; icon: string; label: string }[] = [
  { id: 'Canvas', icon: 'Photo', label: 'Stories' }, // Переименовал для ясности
  { id: 'Control', icon: 'AdjustmentsHorizontal', label: 'Playground' },
  { id: 'Matrix', icon: 'Squares2X2', label: 'Matrix' },
];
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-900">
    
    <!-- HEADER: Tabs & Toolbar -->
    <div class="h-10 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-3 flex-shrink-0 z-20">
      
      <!-- Main Tabs Switcher -->
      <div class="flex bg-gray-900 rounded p-0.5 border border-gray-600">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeMainTab = tab.id" 
          class="px-3 py-0.5 text-xs rounded transition-all flex items-center gap-1.5 font-medium"
          :class="activeMainTab === tab.id 
            ? 'bg-gray-700 text-white shadow-sm' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'"
        >
          <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
          {{ tab.label }}
        </button>
      </div>
      
      <div class="w-px h-4 bg-gray-600 mx-1"></div>
      
      <!-- Canvas Toolbar -->
      <CanvasToolbar 
        v-if="activeMainTab !== 'Matrix'"
        :settings="settings"
        @update:viewport="setViewport"
        @toggle-rotate="toggleRotate"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @reset-zoom="resetZoom"
        @change-bg="settings.background = $event as any"
        class="border-b-0 bg-transparent px-0 flex-1 justify-end"
      />
      
      <div v-else class="flex-1"></div>

    </div>

    <!-- MAIN CONTENT AREA -->
    <div class="flex-1 overflow-hidden relative bg-[#111]">
      
      <!-- VIEW 1: STORIES (CANVAS) -->
      <!-- Рендерим Стори (Wrapper) без пропсов из панели -->
      <template v-if="activeMainTab === 'Canvas'">
        <div class="w-full h-full overflow-auto flex items-center justify-center p-8 custom-scrollbar">
          <div 
            class="relative shadow-2xl transition-all border border-gray-700/50 flex-shrink-0 bg-transparent"
            :style="canvasStyle"
          >
            <div class="w-full h-full overflow-auto" :class="bgClass">
              <div class="p-4 inline-block min-w-full min-h-full">
                <!-- ВАЖНО: передаем component (Story) и пустые пропсы -->
                <UniversalRenderer 
                  :component="component" 
                  :component-props="{}" 
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- VIEW 2: PLAYGROUND (CONTROL) -->
      <!-- Рендерим Чистый Компонент с пропсами -->
      <template v-else-if="activeMainTab === 'Control'">
        <USplitter :default-size="320" :min="250" :max="600">
          
          <!-- LEFT: Sidebar Control Panel -->
          <template #left>
            <div class="h-full flex flex-col bg-gray-900 border-r border-gray-700">
              <!-- Sidebar Tabs -->
              <div class="flex border-b border-gray-700 bg-gray-800">
                  <button 
                    v-for="tab in ['Controls', 'Events', 'Code']" 
                    :key="tab"
                    @click="activeSidebarTab = tab"
                    class="flex-1 py-2 text-[10px] uppercase font-bold text-gray-500 hover:text-gray-200 border-b-2 border-transparent transition-colors"
                    :class="{ 'text-indigo-400 border-indigo-500 bg-gray-900': activeSidebarTab === tab }"
                  >
                    {{ tab }}
                    <span v-if="tab === 'Events' && actionLogs.length" class="ml-1 text-green-500 bg-green-900/30 px-1 rounded-full text-[9px]">{{ actionLogs.length }}</span>
                  </button>
              </div>

              <div class="flex-1 overflow-y-auto custom-scrollbar p-0">
                 <!-- 1. Controls -->
                 <div v-show="activeSidebarTab === 'Controls'" class="p-4 space-y-6">
                    <PropsEditor
                      v-if="meta"
                      :meta="meta"
                      :model-value="localProps"
                      :component-props-meta="componentPropsMeta"
                      @update:model-value="handlePropsUpdate"
                    />
                    
                    <div v-if="meta?.slots?.length" class="border-t border-gray-800 pt-4">
                       <h3 class="text-xs font-bold text-gray-500 uppercase mb-3">Slots</h3>
                       <SlotsEditor 
                          :slots-meta="meta.slots" 
                          v-model="slotContent" 
                       />
                    </div>
                 </div>

                 <!-- 2. Events -->
                 <div v-show="activeSidebarTab === 'Events'" class="h-full">
                    <ActionLogger :logs="actionLogs" @clear="clearLogs" />
                 </div>

                 <!-- 3. Code -->
                 <div v-show="activeSidebarTab === 'Code'" class="h-full flex flex-col">
                    <div class="p-2 border-b border-gray-700 flex justify-end bg-gray-800">
                       <button @click="toggleFreeze" class="text-xs text-blue-400 hover:text-white transition-colors">
                          {{ isFrozen ? 'Unfreeze' : 'Freeze' }}
                       </button>
                    </div>
                    <div class="flex-1 overflow-hidden">
                       <PreviewCodeBlock :code="generatedCode" :show-frozen="false" class="h-full rounded-none border-0" />
                    </div>
                 </div>
              </div>
            </div>
          </template>

          <!-- RIGHT: Render Area -->
          <template #right>
             <div class="w-full h-full overflow-auto flex items-center justify-center p-8 custom-scrollbar bg-[#111]">
              <div 
                class="relative shadow-2xl transition-all border border-gray-700/50 flex-shrink-0 bg-transparent"
                :style="canvasStyle"
              >
                <div class="w-full h-full overflow-auto" :class="bgClass">
                  <div class="p-4 inline-block min-w-full min-h-full">
                    <!-- ВАЖНО: используем componentToRender (Target) и localProps -->
                    <UniversalRenderer 
                      :component="componentToRender" 
                      :component-props="localProps" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </template>

        </USplitter>
      </template>

      <!-- VIEW 3: MATRIX -->
      <template v-else-if="activeMainTab === 'Matrix'">
        <MatrixView 
          :story-component="component" 
          :target-component="targetComponent"
          :meta="meta || { props:[],events:[],slots:[] }" 
          :base-props="localProps" 
        />
      </template>

    </div>
  </div>
</template>
