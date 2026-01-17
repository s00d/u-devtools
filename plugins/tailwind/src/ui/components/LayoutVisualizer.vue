<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { UButton } from '@u-devtools/ui';
import { useBridge, useApi } from '../../context';

const props = defineProps<{
  elementId: string | null;
  classes: string[];
}>();

const bridge = useBridge();
const api = useApi();

const STORAGE_KEY = 'layout-overlay-state';

// Загружаем начальное состояние
const savedState = api.storage.get(STORAGE_KEY, {
  enabled: false,
  showPadding: true,
  showMargin: true,
});

const enabled = ref(savedState.enabled);
const showPadding = ref(savedState.showPadding);
const showMargin = ref(savedState.showMargin);

// Parse spacing classes to extract values
const spacingValues = computed(() => {
  const padding: { top?: string; right?: string; bottom?: string; left?: string } = {};
  const margin: { top?: string; right?: string; bottom?: string; left?: string } = {};

  props.classes.forEach((cls) => {
    // Parse padding classes (p-4, px-2, pt-1, etc.)
    if (cls.startsWith('p-') && !cls.includes(':')) {
      const value = cls.replace('p-', '');
      padding.top = value;
      padding.right = value;
      padding.bottom = value;
      padding.left = value;
    } else if (cls.startsWith('px-') && !cls.includes(':')) {
      const value = cls.replace('px-', '');
      padding.left = value;
      padding.right = value;
    } else if (cls.startsWith('py-') && !cls.includes(':')) {
      const value = cls.replace('py-', '');
      padding.top = value;
      padding.bottom = value;
    } else if (cls.startsWith('pt-') && !cls.includes(':')) {
      padding.top = cls.replace('pt-', '');
    } else if (cls.startsWith('pr-') && !cls.includes(':')) {
      padding.right = cls.replace('pr-', '');
    } else if (cls.startsWith('pb-') && !cls.includes(':')) {
      padding.bottom = cls.replace('pb-', '');
    } else if (cls.startsWith('pl-') && !cls.includes(':')) {
      padding.left = cls.replace('pl-', '');
    }

    // Parse margin classes (m-4, mx-2, mt-1, etc.)
    if (cls.startsWith('m-') && !cls.includes(':')) {
      const value = cls.replace('m-', '');
      margin.top = value;
      margin.right = value;
      margin.bottom = value;
      margin.left = value;
    } else if (cls.startsWith('mx-') && !cls.includes(':')) {
      const value = cls.replace('mx-', '');
      margin.left = value;
      margin.right = value;
    } else if (cls.startsWith('my-') && !cls.includes(':')) {
      const value = cls.replace('my-', '');
      margin.top = value;
      margin.bottom = value;
    } else if (cls.startsWith('mt-') && !cls.includes(':')) {
      margin.top = cls.replace('mt-', '');
    } else if (cls.startsWith('mr-') && !cls.includes(':')) {
      margin.right = cls.replace('mr-', '');
    } else if (cls.startsWith('mb-') && !cls.includes(':')) {
      margin.bottom = cls.replace('mb-', '');
    } else if (cls.startsWith('ml-') && !cls.includes(':')) {
      margin.left = cls.replace('ml-', '');
    }
  });

  return { padding, margin };
});

// Send visualization state to app context
const sendVisualizationState = () => {
  if (props.elementId) {
    if (enabled.value) {
      bridge.send('show-layout-overlay', {
        udtId: String(props.elementId),
        showPadding: Boolean(showPadding.value),
        showMargin: Boolean(showMargin.value),
      });
    } else {
      bridge.send('hide-layout-overlay', {});
    }
  }
};

// Сохраняем состояние при изменении
watch([enabled, showPadding, showMargin], () => {
  api.storage.set(STORAGE_KEY, {
    enabled: enabled.value,
    showPadding: showPadding.value,
    showMargin: showMargin.value,
  });
  sendVisualizationState();
});

// Если поменялся элемент, нужно восстановить оверлей для него (если он включен)
watch(() => props.elementId, (newId) => {
  if (newId && enabled.value) {
    // Небольшая задержка, чтобы DOM успел обновиться
    setTimeout(() => sendVisualizationState(), 50);
  }
});

// При монтировании тоже пробуем отправить (на случай восстановления сессии)
onMounted(() => {
  if (props.elementId && enabled.value) {
    sendVisualizationState();
  }
});
</script>

<template>
  <div class="space-y-3 p-4 bg-gray-800 rounded border border-gray-700">
    <div class="flex justify-between items-center">
      <h3 class="text-xs font-bold text-gray-400 uppercase">Layout Visualizer</h3>
      <UButton
        size="xs"
        :variant="enabled ? 'primary' : 'secondary'"
        @click="enabled = !enabled"
      >
        {{ enabled ? 'Hide' : 'Show' }} Overlay
      </UButton>
    </div>

    <div v-if="enabled" class="space-y-2">
      <label class="flex items-center gap-2 text-xs text-gray-300">
        <input
          v-model="showPadding"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
        />
        <span>Show Padding</span>
      </label>
      <label class="flex items-center gap-2 text-xs text-gray-300">
        <input
          v-model="showMargin"
          type="checkbox"
          class="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
        />
        <span>Show Margin</span>
      </label>

      <!-- Spacing Summary -->
      <div class="mt-3 pt-3 border-t border-gray-700 space-y-1 text-xs font-mono">
        <div v-if="showPadding" class="text-green-400">
          <div class="font-bold mb-1">Padding:</div>
          <div v-if="spacingValues.padding.top" class="text-gray-400">
            <span v-if="spacingValues.padding.top === spacingValues.padding.bottom && spacingValues.padding.left === spacingValues.padding.right">
              p-{{ spacingValues.padding.top }}
            </span>
            <span v-else>
              pt-{{ spacingValues.padding.top || '0' }} pr-{{ spacingValues.padding.right || '0' }} pb-{{ spacingValues.padding.bottom || '0' }} pl-{{ spacingValues.padding.left || '0' }}
            </span>
          </div>
          <div v-else class="text-gray-600">No padding classes</div>
        </div>
        <div v-if="showMargin" class="text-orange-400">
          <div class="font-bold mb-1">Margin:</div>
          <div v-if="spacingValues.margin.top" class="text-gray-400">
            <span v-if="spacingValues.margin.top === spacingValues.margin.bottom && spacingValues.margin.left === spacingValues.margin.right">
              m-{{ spacingValues.margin.top }}
            </span>
            <span v-else>
              mt-{{ spacingValues.margin.top || '0' }} mr-{{ spacingValues.margin.right || '0' }} mb-{{ spacingValues.margin.bottom || '0' }} ml-{{ spacingValues.margin.left || '0' }}
            </span>
          </div>
          <div v-else class="text-gray-600">No margin classes</div>
        </div>
      </div>
    </div>
  </div>
</template>
