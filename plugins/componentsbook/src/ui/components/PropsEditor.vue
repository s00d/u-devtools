<script setup lang="ts">
import { ref, watch } from 'vue';
import { UInput, USelect } from '@u-devtools/ui';
import type { ComponentMeta, ComponentPropsMeta } from '../../types';

// Re-export for backward compatibility
export type { ComponentPropsMeta };

const props = withDefaults(
  defineProps<{
    meta: ComponentMeta;
    modelValue: Record<string, any>;
    componentPropsMeta?: ComponentPropsMeta | null;
  }>(),
  {
    componentPropsMeta: null,
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>];
}>();

const localProps = ref<Record<string, any>>({ ...props.modelValue });
const jsonErrors = ref<Record<string, boolean>>({});
const jsonRawValues = ref<Record<string, string>>({});

// === ИСПРАВЛЕНИЕ: Улучшенное определение типа ===
const getFieldType = (propName: string): 'text' | 'select' | 'checkbox' | 'number' | 'json' => {
  // 1. Приоритет: явная настройка через componentPropsMeta
  if (props.componentPropsMeta?.[propName]) {
    return props.componentPropsMeta[propName].fieldType;
  }

  // 2. Проверка по текущему значению (если оно есть)
  const val = props.modelValue[propName];
  if (typeof val === 'boolean') return 'checkbox';
  if (typeof val === 'number') return 'number';
  if (typeof val === 'object' && val !== null) return 'json';

  // 3. Проверка по метаданным (docgen)
  const prop = props.meta.props.find((p) => p.name === propName);
  
  if (prop?.type) {
    const t = prop.type.toLowerCase();
    
    // ИСПРАВЛЕНО: используем includes вместо строгого равенства
    // Это покроет случаи: "Boolean", "boolean | undefined", "boolean | null"
    if (t.includes('boolean') || t.includes('bool')) return 'checkbox';
    
    if (t.includes('number') || t.includes('int') || t.includes('float')) return 'number';
    
    if (prop.values && prop.values.length > 0) return 'select';
    
    if (t.includes('array') || t.includes('object') || t.includes('[]') || t.includes('record')) return 'json';
  }

  // 4. Эвристика по имени (для стандартных флагов)
  const booleanKeywords = [
    'disabled', 'loading', 'active', 'checked', 'selected', 
    'readonly', 'required', 'visible', 'open', 'show', 'hide', 
    'dense', 'outline', 'rounded', 'border', 'flat', 'solid', 'ghost'
  ];
  
  if (booleanKeywords.some(k => propName.toLowerCase().includes(k))) {
    return 'checkbox';
  }
  
  if (propName.startsWith('is') || propName.startsWith('has')) {
    // isEnabled, hasError...
    // Проверяем, что следующая буква заглавная (isXxx), чтобы не цеплять "issue"
    if (propName.length > 2 && propName[2] === propName[2].toUpperCase()) {
        return 'checkbox';
    }
  }

  return 'text';
};

const getSelectOptions = (propName: string): string[] => {
  return props.componentPropsMeta?.[propName]?.options || [];
};

const getSelectOptionsFormatted = (propName: string) => {
  const prop = props.meta.props.find((p) => p.name === propName);
  const values = getSelectOptions(propName).length 
    ? getSelectOptions(propName) 
    : prop?.values || [];

  return values.map((v) => {
    const cleaned = v.replace(/^['"]|['"]$/g, '');
    return { label: cleaned, value: cleaned };
  });
};

watch(
  () => props.modelValue,
  (newVal) => {
    Object.keys(newVal).forEach((key) => {
      if (localProps.value[key] !== newVal[key]) {
        localProps.value[key] = newVal[key];
        if (getFieldType(key) === 'json' && !jsonErrors.value[key]) {
          try {
            jsonRawValues.value[key] = JSON.stringify(newVal[key], null, 2);
          } catch {
            jsonRawValues.value[key] = '{}';
          }
        }
      }
    });
    
    // Инициализация JSON полей
    Object.keys(newVal).forEach((key) => {
      if (getFieldType(key) === 'json' && !jsonRawValues.value[key]) {
        try {
          jsonRawValues.value[key] = JSON.stringify(newVal[key], null, 2);
        } catch {
          jsonRawValues.value[key] = '{}';
        }
      }
    });
  },
  { deep: true, immediate: true }
);

const emitUpdate = () => {
  emit('update:modelValue', { ...localProps.value });
};

const updateProp = (key: string, val: any) => {
  localProps.value[key] = val;
  emitUpdate();
};

const handleJsonInput = (key: string, rawValue: string) => {
  jsonRawValues.value[key] = rawValue;
  try {
    const parsed = JSON.parse(rawValue);
    jsonErrors.value[key] = false;
    updateProp(key, parsed);
  } catch (e) {
    jsonErrors.value[key] = true;
  }
};

const formatType = (type: string) => type.replace(/\|/g, ' | ');
</script>

<template>
  <div class="space-y-6">
    <div v-for="prop in meta.props" :key="prop.name" class="group">
      <div class="flex items-center justify-between mb-1.5">
        <label class="text-sm font-semibold text-gray-200 flex items-center gap-1 cursor-default" :title="prop.name">
          {{ prop.name }}
          <span v-if="prop.required" class="text-red-400" title="Required">*</span>
        </label>
        <span v-if="prop.type" class="text-[10px] text-gray-500 font-mono bg-gray-800 px-1.5 py-0.5 rounded truncate max-w-[150px]" :title="prop.type">
          {{ formatType(prop.type) }}
        </span>
      </div>

      <!-- CHECKBOX (Boolean) -->
      <div v-if="getFieldType(prop.name) === 'checkbox'" 
           class="flex items-center justify-between bg-gray-900/50 p-2 rounded border transition-colors cursor-pointer select-none"
           :class="localProps[prop.name] ? 'border-indigo-500/40 bg-indigo-900/10' : 'border-gray-700 hover:border-gray-600'"
           @click="updateProp(prop.name, !localProps[prop.name])"
      >
        <div class="flex items-center gap-3">
            <div 
               class="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
               :class="localProps[prop.name] ? 'bg-indigo-600' : 'bg-gray-600'"
            >
                <span
                aria-hidden="true"
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="localProps[prop.name] ? 'translate-x-4' : 'translate-x-0'"
                />
            </div>
            <span class="text-xs font-mono" :class="localProps[prop.name] ? 'text-indigo-300' : 'text-gray-500'">
                {{ localProps[prop.name] ? 'true' : 'false' }}
            </span>
        </div>
        
        <!-- Кнопка сброса в undefined (если не required) -->
        <button 
           v-if="!prop.required && localProps[prop.name] !== undefined" 
           @click.stop="updateProp(prop.name, undefined)"
           class="text-[10px] text-gray-600 hover:text-gray-400"
           title="Reset to default"
        >
           ↺
        </button>
      </div>

      <!-- NUMBER -->
      <UInput
        v-else-if="getFieldType(prop.name) === 'number'"
        :model-value="localProps[prop.name]"
        @update:model-value="(val) => updateProp(prop.name, val === '' ? undefined : Number(val))"
        type="number"
        size="sm"
        class="font-mono"
        :placeholder="prop.default"
      />

      <!-- SELECT -->
      <USelect
        v-else-if="getFieldType(prop.name) === 'select'"
        :model-value="localProps[prop.name]"
        :options="getSelectOptionsFormatted(prop.name)"
        @update:model-value="(val) => updateProp(prop.name, val)"
        size="sm"
      />

      <!-- JSON -->
      <div v-else-if="getFieldType(prop.name) === 'json'" class="relative">
        <textarea
            :value="jsonRawValues[prop.name] ?? JSON.stringify(localProps[prop.name], null, 2)"
            @input="(e) => handleJsonInput(prop.name, (e.target as HTMLTextAreaElement).value)"
            class="w-full bg-gray-900 border text-xs font-mono p-2 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-y custom-scrollbar"
            :class="jsonErrors[prop.name] ? 'border-red-500 text-red-100' : 'border-gray-700 text-gray-300'"
            spellcheck="false"
        ></textarea>
        <div v-if="jsonErrors[prop.name]" class="absolute bottom-2 right-2 text-[10px] text-red-400 bg-gray-900/90 px-1 rounded border border-red-500/30">
            Invalid JSON
        </div>
      </div>

      <!-- TEXT (Default) -->
      <UInput
        v-else
        :model-value="localProps[prop.name]"
        @update:model-value="(val) => updateProp(prop.name, val)"
        size="sm"
        :placeholder="prop.default"
      />

      <!-- Description -->
      <div v-if="prop.description || prop.default" class="mt-1.5 flex justify-between items-start gap-2">
         <div v-if="prop.description" class="text-[11px] text-gray-500 leading-tight">
            {{ prop.description }}
         </div>
         <div v-if="prop.default" class="text-[10px] text-gray-600 font-mono whitespace-nowrap ml-auto bg-gray-800 px-1 rounded" title="Default value">
            {{ prop.default }}
         </div>
      </div>
    </div>

    <div v-if="meta.props.length === 0" class="text-sm text-gray-500 text-center py-8 bg-gray-800/30 rounded border border-dashed border-gray-700">
      No props detected
    </div>
  </div>
</template>
