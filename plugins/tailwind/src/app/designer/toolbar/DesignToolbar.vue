<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useBridge } from '../../../context';
import { useBridgeState } from '../../composables/useBridgeState';
import { UIcon, UColorPicker, UDropdown, UColorGrid, type ColorOption } from '@u-devtools/ui';
import { enableTextEditing } from '../text-editor';
import type { ElementRect } from '@u-devtools/overlay';

const props = defineProps<{
  rect: ElementRect; // Получаем готовые координаты от родителя
}>();

const bridge = useBridge();
const { selectedElement, selectionInfo, updateSelectionInfo, rescanElement } = useBridgeState(bridge);
const isSaving = ref(false);

onMounted(() => {
  bridge.on('save-status', ({ status }: { status: 'start' | 'success' | 'error' }) => {
    isSaving.value = status === 'start';
  });
});

// Умное позиционирование тулбара
const style = computed(() => {
  const { top, left, height } = props.rect;

  // Высота тулбара (может быть больше из-за цветовых пикеров)
  const toolbarHeight = 44;

  // По умолчанию над элементом
  let toolbarTop = top - toolbarHeight - 8;

  // Если места сверху нет, ставим под элементом
  if (toolbarTop < 10) {
    toolbarTop = top + height + 10;
  }

  // Ограничиваем по горизонтали (учитываем возможную ширину тулбара)
  const maxLeft = window.innerWidth - 500;
  const safeLeft = Math.max(10, Math.min(left, maxLeft));

  return {
    top: `${toolbarTop}px`,
    left: `${safeLeft}px`,
  };
});

const hasClass = (cls: string) => selectionInfo.classes.includes(cls);

const toggleClass = (cls: string) => {
  if (!selectedElement.value) return;
  if (selectedElement.value.classList.contains(cls)) {
    selectedElement.value.classList.remove(cls);
  } else {
    selectedElement.value.classList.add(cls);
  }
  sync();
};

const setAlign = (align: string) => {
  if (!selectedElement.value) return;
  selectedElement.value.classList.remove('text-left', 'text-center', 'text-right', 'text-justify');
  selectedElement.value.classList.add(`text-${align}`);
  sync();
};

const sync = () => {
  if (!selectedElement.value) return;
  // Обновляем selectionInfo сразу, чтобы кнопки реагировали мгновенно
  updateSelectionInfo(selectedElement.value);
  // Отправляем обновление классов в DOM
  bridge.send('update-classes', {
    udtId: String(selectedElement.value.getAttribute('data-udt-id') || ''),
    classes: Array.from(selectedElement.value.classList).map(String),
  });
  // ВАЖНО: Отправляем полное обновление элемента в панель, чтобы модель синхронизировалась
  // Это нужно, чтобы при сохранении использовались актуальные классы
  rescanElement(selectedElement.value);
};

const handleMagicFix = () => bridge.send('magic-fix', {});
const handleTextEdit = () => enableTextEditing();
const handleSave = () => bridge.send('request-save', {});

// Color management
const getCurrentColor = (type: 'text' | 'bg'): string => {
  if (!selectedElement.value) return '';
  const classes = selectionInfo.classes;
  // Find color class matching pattern: text-*-* or bg-*-* (with optional opacity /50)
  const colorClass = classes.find((cls) => {
    if (!cls.startsWith(`${type}-`)) return false;
    const rest = cls.replace(`${type}-`, '');
    // Match pattern: color-shade or color-shade/opacity
    return /^[a-z]+-\d+(\/\d+)?$/.test(rest);
  });
  return colorClass || '';
};

const setColor = (type: 'text' | 'bg', value: string) => {
  if (!selectedElement.value) return;
  
  // Remove existing color classes of this type (including opacity variants)
  const classesToRemove = selectionInfo.classes.filter((cls) => {
    if (type === 'text') {
      return cls.startsWith('text-') && /^text-[a-z]+-\d+(\/\d+)?$/.test(cls);
    } else {
      return cls.startsWith('bg-') && /^bg-[a-z]+-\d+(\/\d+)?$/.test(cls);
    }
  });
  
  classesToRemove.forEach((cls) => {
    if (selectedElement.value) {
      selectedElement.value.classList.remove(cls);
    }
  });
  
  // Add new color class if provided
  if (value) {
    selectedElement.value.classList.add(value);
  }
  
  sync();
};

const textColor = computed({
  get: () => getCurrentColor('text'),
  set: (value) => setColor('text', value),
});

const bgColor = computed({
  get: () => getCurrentColor('bg'),
  set: (value) => setColor('bg', value),
});

// Spacing management (padding/margin)
const spacingValues = ['0', '1', '2', '3', '4', '6', '8', '12', '16', '20', '24', '32', 'auto'];

const getSpacing = (prefix: string): string => {
  const regex = new RegExp(`^${prefix}-([0-9.]+|px|auto)$`);
  const found = selectionInfo.classes.find((c) => regex.test(c));
  return found ? found.split('-').pop() || '0' : '0';
};

const setSpacing = (prefix: string, value: string) => {
  if (!selectedElement.value) return;
  
  // Remove all spacing classes with this prefix
  const classesToRemove = selectionInfo.classes.filter((cls) => cls.startsWith(`${prefix}-`));
  classesToRemove.forEach((cls) => {
    if (selectedElement.value) {
      selectedElement.value.classList.remove(cls);
    }
  });
  
  // Add new spacing class if value is not '0'
  if (value !== '0') {
    selectedElement.value.classList.add(`${prefix}-${value}`);
  }
  
  sync();
};

// Padding
const padding = computed({
  get: () => getSpacing('p'),
  set: (value) => setSpacing('p', value),
});

// Margin
const margin = computed({
  get: () => getSpacing('m'),
  set: (value) => setSpacing('m', value),
});

// Predefined color options (standard Tailwind colors)
const createColorOptions = (type: 'text' | 'bg' | 'border'): ColorOption[] => {
  const colors = [
    { name: 'Slate', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Gray', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Zinc', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Neutral', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Stone', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Red', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Orange', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Amber', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Yellow', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Lime', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Green', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Emerald', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Teal', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Cyan', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Sky', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Blue', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Indigo', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Violet', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Purple', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Fuchsia', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Pink', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Rose', shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  ];

  const options: ColorOption[] = [];

  colors.forEach((color) => {
    color.shades.forEach((shade) => {
      const className = `${type}-${color.name.toLowerCase()}-${shade}`;
      options.push({
        name: `${color.name} ${shade}`,
        value: className,
      });
    });
  });

  return options;
};

const textColorOptions = createColorOptions('text');
const bgColorOptions = createColorOptions('bg');
</script>

<template>
  <!--
    FIX:
    1. Используем стандартные классы (bg-zinc-900 вместо [#...])
    2. pointer-events-auto обязательно, так как контейнер плагина имеет pointer-events-none
  -->
  <div
    class="fixed bg-zinc-900 rounded-lg shadow-xl flex items-center px-2 py-1 gap-2 border border-zinc-700 pointer-events-auto z-9010 text-zinc-200"
    :style="style"
  >
    <!-- Badge -->
    <div class="px-2 py-0.5 bg-indigo-600 rounded text-[10px] font-bold text-white uppercase font-mono tracking-tight shadow-sm">
      {{ selectionInfo.tagName }}
    </div>

    <!-- Divider -->
    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Formatting -->
    <div class="flex items-center gap-0.5">
      <button
        class="flex items-center justify-center w-7 h-7 rounded transition-colors border"
        :class="hasClass('font-bold') ? 'bg-indigo-600 text-white border-indigo-500' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100'"
        @click="toggleClass('font-bold')"
        title="Bold"
      >
        <UIcon name="Bold" class="w-4 h-4 text-current" />
      </button>
      <button
        class="flex items-center justify-center w-7 h-7 rounded transition-colors border"
        :class="hasClass('italic') ? 'bg-indigo-600 text-white border-indigo-500' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100'"
        @click="toggleClass('italic')"
        title="Italic"
      >
        <UIcon name="Italic" class="w-4 h-4 text-current" />
      </button>
    </div>

    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Alignment -->
    <div class="flex items-center gap-0.5">
      <button
        class="flex items-center justify-center w-7 h-7 rounded transition-colors border"
        :class="hasClass('text-left') ? 'bg-indigo-600 text-white border-indigo-500' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100'"
        @click="setAlign('left')"
        title="Align Left"
      >
        <UIcon name="Bars3BottomLeft" class="w-4 h-4 text-current" />
      </button>
      <button
        class="flex items-center justify-center w-7 h-7 rounded transition-colors border"
        :class="hasClass('text-center') ? 'bg-indigo-600 text-white border-indigo-500' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100'"
        @click="setAlign('center')"
        title="Align Center"
      >
        <UIcon name="Bars3" class="w-4 h-4 text-current" />
      </button>
      <button
        class="flex items-center justify-center w-7 h-7 rounded transition-colors border"
        :class="hasClass('text-right') ? 'bg-indigo-600 text-white border-indigo-500' : 'text-white bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100'"
        @click="setAlign('right')"
        title="Align Right"
      >
        <UIcon name="Bars3BottomRight" class="w-4 h-4 text-current" />
      </button>
    </div>

    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Colors -->
    <div class="flex items-center gap-1">
      <UColorPicker
        v-model="textColor"
        type="text"
        size="xs"
        :show-opacity="true"
        :show-none="true"
        :colors="textColorOptions"
        title="Text Color"
      >
        <template #preview="{ selected }">
          <div
            v-if="selected && selected.value"
            class="w-3 h-3 rounded border border-zinc-600"
            :class="selected.value"
          />
        </template>
        <template #colors="{ colors, currentColor, onSelect }">
          <UColorGrid :colors="colors" :current-color="currentColor" :on-select="onSelect">
            <template #item="{ option, selected, onClick }">
              <button
                type="button"
                :class="[
                  'aspect-square rounded border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  selected
                    ? 'ring-2 ring-indigo-500 border-indigo-400'
                    : 'border-zinc-700 hover:border-zinc-600',
                  // Преобразуем text-* в bg-* для preview цвета
                  option.value?.startsWith('text-') 
                    ? option.value.replace(/^text-/, 'bg-')
                    : option.value || '',
                ]"
                :title="option.name"
                @click="onClick"
              />
            </template>
          </UColorGrid>
        </template>
      </UColorPicker>
      <UColorPicker
        v-model="bgColor"
        type="bg"
        size="xs"
        :show-opacity="true"
        :show-none="true"
        :colors="bgColorOptions"
        title="Background Color"
      >
        <template #preview="{ selected }">
          <div
            v-if="selected && selected.value"
            class="w-3 h-3 rounded border border-zinc-600"
            :class="selected.value"
          />
        </template>
        <template #colors="{ colors, currentColor, onSelect }">
          <UColorGrid :colors="colors" :current-color="currentColor" :on-select="onSelect">
            <template #item="{ option, selected, onClick }">
              <button
                type="button"
                :class="[
                  'aspect-square rounded border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  selected
                    ? 'ring-2 ring-indigo-500 border-indigo-400'
                    : 'border-zinc-700 hover:border-zinc-600',
                  // Преобразуем text-* в bg-* для preview цвета
                  option.value?.startsWith('text-') 
                    ? option.value.replace(/^text-/, 'bg-')
                    : option.value || '',
                ]"
                :title="option.name"
                @click="onClick"
              />
            </template>
          </UColorGrid>
        </template>
      </UColorPicker>
    </div>

    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Spacing -->
    <div class="flex items-center gap-1">
      <UDropdown
        v-model="padding"
        :options="spacingValues.map(v => ({ label: v === '0' ? 'None' : v, value: v }))"
        placeholder="P"
        size="xs"
        @update:model-value="padding = $event"
      />
      <UDropdown
        v-model="margin"
        :options="spacingValues.map(v => ({ label: v === '0' ? 'None' : v, value: v }))"
        placeholder="M"
        size="xs"
        @update:model-value="margin = $event"
      />
    </div>

    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Edit Text -->
    <button
      class="flex items-center justify-center w-7 h-7 rounded text-white bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 hover:text-zinc-100 transition-colors"
      @click="handleTextEdit"
      title="Edit Text"
    >
      <UIcon name="Pencil" class="w-4 h-4 text-current" />
    </button>

    <div class="w-px h-4 bg-zinc-700"></div>

    <!-- Actions -->
    <div class="flex items-center gap-0.5">
      <!-- Save -->
      <button
        class="flex items-center justify-center w-7 h-7 rounded text-blue-400 bg-zinc-800 border border-zinc-700 hover:bg-blue-900/30 hover:text-blue-200 hover:border-blue-700/50 transition-colors"
        @click="handleSave"
        :title="isSaving ? 'Saving...' : 'Save to Source'"
      >
        <UIcon v-if="isSaving" name="ArrowPath" class="w-4 h-4 animate-spin text-current" />
        <UIcon v-else name="CloudArrowUp" class="w-4 h-4 text-current" />
      </button>

      <!-- Magic Fix -->
      <button
        class="flex items-center justify-center w-7 h-7 rounded text-yellow-400 bg-zinc-800 border border-zinc-700 hover:bg-yellow-900/30 hover:text-yellow-200 hover:border-yellow-700/50 transition-colors"
        @click="handleMagicFix"
        title="Auto-fix styles"
      >
        <UIcon name="Sparkles" class="w-4 h-4 text-current" />
      </button>
    </div>
  </div>
</template>
