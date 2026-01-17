<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useBridge, useApi } from '../context';
import { useBridgeState as useSyncedRef } from '@u-devtools/kit/vue'; // Адаптер
import type { TailwindConfigSummary } from '../types';

// Components
import ClassInput from './components/ClassInput.vue';
import VisualGui from './components/VisualGui.vue';
import ResponsiveMatrix from './components/ResponsiveMatrix.vue';
import CodeExporter from './components/CodeExporter.vue';
import ThemePalette from './components/ThemePalette.vue';
import LayoutVisualizer from './components/LayoutVisualizer.vue';
import StateSimulator from './components/StateSimulator.vue';
import SpacingEditor from './components/SpacingEditor.vue';
import TypographyEditor from './components/TypographyEditor.vue';
import { UAccordion, UIcon, UButton, UEmpty } from '@u-devtools/ui';
import { generateUtilityClasses } from '../utils/classes';
import { useActiveElement } from './composables/useActiveElement';

const bridge = useBridge();
const api = useApi();
const { activeElement, loadElement, clearElement } = useActiveElement(api);

const config = ref<TailwindConfigSummary | null>(null);
const allUtilities = ref<string[]>([]);
const loading = ref(false);

// --- STATE ---
// Подключаемся к ТЕМ ЖЕ переменным, что и в App
// Теперь isInspecting.value = true здесь автоматически сделает true в App
const isInspecting = useSyncedRef(bridge.state('isInspecting', false));
const isDesignMode = useSyncedRef(bridge.state('isDesignMode', false));

// Взаимоисключение (можно продублировать логику или полагаться на App)
watch(isInspecting, (val) => { if (val) isDesignMode.value = false; });
watch(isDesignMode, (val) => { if (val) isInspecting.value = false; });

// --- ACTIONS ---
// Теперь функции toggle стали тривиальными
const toggleInspect = () => { isInspecting.value = !isInspecting.value; };
const toggleDesignMode = () => { isDesignMode.value = !isDesignMode.value; };

// --- LISTENERS ---

const handleElementUpdate = (state: any) => {
  loadElement(state);
  // Если пришел элемент — значит инспектор сработал, выключаем кнопку
  if (isInspecting.value) {
    isInspecting.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  // Загружаем конфиг
  try {
    const res = await api.rpc.call<{ success: boolean; config?: TailwindConfigSummary }>('tailwind:get-config');
    if (res.success && res.config) {
      config.value = res.config;
      allUtilities.value = generateUtilityClasses(res.config);
    }
  } finally {
    loading.value = false;
  }

  bridge.on('element-update', handleElementUpdate);
  
  bridge.on('request-save', () => {
    if (activeElement.value?.source) {
      activeElement.value.save();
    }
  });

  // Сохранение и восстановление последнего выбранного элемента
  const STORAGE_KEY_LAST_LOC = 'last-loc';
  
  bridge.on('save-last-loc', ({ loc }) => {
    api.storage.set(STORAGE_KEY_LAST_LOC, loc);
  });
  
  bridge.on('clear-last-loc', () => {
    api.storage.remove(STORAGE_KEY_LAST_LOC);
  });

  // Восстанавливаем последний выбранный элемент после перезагрузки
  // Делаем это с небольшой задержкой, чтобы DOM успел загрузиться
  setTimeout(() => {
    const savedLoc = api.storage.get<string>(STORAGE_KEY_LAST_LOC, '');
    if (savedLoc) {
      // Отправляем событие восстановления в App контекст
      bridge.send('restore-selection', { loc: savedLoc });
    }
  }, 200);
});

// Обработка ESC и клика вне попапа
const handleClosePopup = () => {
  isInspecting.value = false;
};

const handleOutsideClick = () => {
  isInspecting.value = false;
};

const handleClearSelection = () => {
  clearElement();
  bridge.send('clear-selection', {});
};

onUnmounted(() => {
  // Сбрасываем переменные при закрытии
  isInspecting.value = false;
  isDesignMode.value = false;
  clearElement();
});

const getFileName = (path: string) => path.split('/').pop() || path;
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="Squares2X2" class="w-5 h-5" />
            Tailwind
          </h2>
          <div class="flex items-center gap-2">
            <div class="h-4 w-px bg-gray-700"></div>
            <!-- Кнопка Инспектора -->
            <UButton
              :variant="isInspecting ? 'primary' : 'ghost'"
              icon="MagnifyingGlass"
              size="sm"
              @click="toggleInspect"
              :class="{ 'animate-pulse': isInspecting }"
            >
              {{ isInspecting ? 'Pick Element...' : 'Inspect' }}
            </UButton>
            
            <!-- Кнопка Дизайн режима -->
            <UButton
              :variant="isDesignMode ? 'primary' : 'ghost'"
              icon="CursorArrowRays"
              size="sm"
              @click="toggleDesignMode"
            >
              Design Mode
            </UButton>

            <div v-if="activeElement" class="flex gap-1 text-xs font-mono ml-2">
              <span class="text-indigo-500 font-bold">&lt;{{ activeElement.tagName }}&gt;</span>
              <span v-if="activeElement.source" class="text-gray-400">
                {{ getFileName(activeElement.source.file) }}:{{ activeElement.source.line }}
              </span>
            </div>
            <UButton
              v-if="activeElement"
              variant="ghost"
              size="sm"
              icon="XMark"
              @click="handleClearSelection"
              title="Clear selection"
            />
          </div>
        </div>
        
        <!-- Actions Right -->
        <div v-if="activeElement" class="flex gap-1 shrink-0">
          <UButton size="sm" variant="ghost" icon="ArrowPath" @click="activeElement.tidy()" title="Sort" />
          <UButton size="sm" variant="ghost" icon="ArrowUturnLeft" :disabled="!activeElement.canUndo" @click="activeElement.undo()" />
          <UButton size="sm" variant="ghost" icon="ArrowUturnRight" :disabled="!activeElement.canRedo" @click="activeElement.redo()" />
          <UButton 
            v-if="activeElement.source" 
            size="sm" variant="primary" icon="CloudArrowUp" 
            :loading="activeElement.isSaving.value" 
            :disabled="!activeElement.isDirty.value"
            @click="activeElement.save()" 
            title="Save to File" 
          />
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-500">Loading...</div>

    <!-- Content / Empty State -->
    <div v-if="activeElement" class="flex-1 overflow-y-auto">
      <div class="p-4 border-b border-gray-800">
        <ClassInput :model-value="activeElement.classes.value" :suggestions="allUtilities" @update:model-value="(v) => activeElement?.setClasses(v)" />
      </div>
      <div class="pl-4">
        <UAccordion title="Layout" default-open>
          <div class="p-3">
            <VisualGui :classes="activeElement.classes.value" :on-change="(v) => activeElement?.setClasses(v)" />
          </div>
        </UAccordion>
        <UAccordion title="Spacing" default-open>
          <div class="p-3">
            <SpacingEditor :classes="activeElement.classes.value" :on-change="(v) => activeElement?.setClasses(v)" />
          </div>
        </UAccordion>
        <UAccordion title="Typography">
          <TypographyEditor :classes="activeElement.classes.value" :on-change="(v) => activeElement?.setClasses(v)" />
        </UAccordion>
        <UAccordion title="Responsive">
          <div class="p-3">
            <ResponsiveMatrix :classes="activeElement.classes.value" :on-change="(v) => activeElement?.setClasses(v)" />
          </div>
        </UAccordion>
        <UAccordion title="Theme">
          <div class="p-3">
            <ThemePalette v-if="config" :colors="config.theme.colors" :on-select="(cls) => activeElement?.addClass(cls)" />
          </div>
        </UAccordion>
        <UAccordion title="Visualizer">
          <div class="p-3">
            <LayoutVisualizer :element-id="activeElement.id" :classes="activeElement.classes.value" />
          </div>
        </UAccordion>
        <UAccordion title="States">
          <div class="p-3">
            <StateSimulator :element-id="activeElement.id" />
          </div>
        </UAccordion>
        <UAccordion title="Export">
          <div class="p-3">
            <CodeExporter :classes="activeElement.classes.value" :tag-name="activeElement.tagName" />
          </div>
        </UAccordion>
      </div>
    </div>
    <UEmpty v-else title="Select Element" description="Select an element to edit Tailwind classes" icon="Squares2X2" />

    <!-- Inspector Active Popup -->
    <div
      v-if="isInspecting"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
      @click.self="handleOutsideClick"
    >
      <div class="bg-[#252526] p-6 rounded-xl shadow-2xl text-center border border-indigo-500 pointer-events-auto relative">
        <button
          @click="handleClosePopup"
          class="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded transition-colors"
        >
          <UIcon name="XMark" class="w-5 h-5" />
        </button>
        <UIcon name="MagnifyingGlass" class="w-12 h-12 mx-auto text-indigo-400 mb-4 animate-bounce" />
        <h3 class="text-xl font-bold text-white mb-2">Pick an element</h3>
        <p class="text-gray-400">Hover and click on any element to inspect it.</p>
        <p class="text-xs text-gray-500 mt-4">Press ESC to cancel</p>
      </div>
    </div>
  </div>
</template>
