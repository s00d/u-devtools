<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentMeta } from '../../types';
import UniversalRenderer from './UniversalRenderer.vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  storyComponent: any;
  targetComponent?: any;
  meta: ComponentMeta;
  baseProps: Record<string, any>;
}>();

// Если targetComponent передан явно — используем его (чистый компонент).
// Если нет — используем storyComponent (обертка), но это может выглядеть криво в матрице.
const componentToRender = computed(() => props.targetComponent || props.storyComponent);

// Определяем, используем ли мы чистый компонент или фоллбэк
const isUsingFallback = computed(() => !props.targetComponent);

// Хелпер для заглушек (дублируем логику, чтобы компонент был самодостаточным)
function getPlaceholder(type: string, name: string): any {
  const t = type.toLowerCase();
  if (t.includes('string')) {
    if (name.toLowerCase().includes('label')) return 'Label';
    if (name.toLowerCase().includes('title')) return 'Title';
    if (name.toLowerCase().includes('text')) return 'Text';
    if (name.toLowerCase().includes('color')) return 'red';
    if (name.toLowerCase().includes('name')) return 'Name';
    if (name.toLowerCase().includes('value')) return 'Value';
    return 'Sample Text';
  }
  if (t.includes('number')) return 0;
  if (t.includes('boolean')) return false;
  if (t.includes('array')) return [];
  if (t.includes('object')) return {};
  return undefined;
}

// 1. Формируем "безопасные" базовые пропсы
// Берем то, что пришло сверху (из контролов), и дополняем заглушками для обязательных полей
const safeBaseProps = computed(() => {
  const safe = { ...props.baseProps };
  
  if (props.meta?.props) {
    props.meta.props.forEach((p) => {
      // Если проп обязательный и его нет в текущих значениях (или он undefined/null)
      if (p.required && (safe[p.name] === undefined || safe[p.name] === null)) {
        // Пробуем взять дефолт
        if (p.default) {
          // Тут упрощенно, парсинг дефолтов сложнее, но для строк сойдет
          safe[p.name] = p.default.replace(/^['"]|['"]$/g, '');
        } else {
          // Иначе генерируем заглушку
          safe[p.name] = getPlaceholder(p.type, p.name);
        }
      }
    });
  }
  return safe;
});

// 2. Вариативные пропсы
const variantProps = computed(() => {
  return props.meta.props.filter((p) => {
    if (p.type?.toLowerCase() === 'boolean') return true;
    if ((p.values?.length ?? 0) > 1 && (p.values?.length ?? 0) < 10) return true;
    if (p.type?.includes('|') && (p.type.length ?? 0) < 100) return true;
    return false;
  });
});

// 3. Генерация матрицы
const matrixData = computed(() => {
  // Если нет вариативных пропсов, рендерим один вариант с безопасными пропсами
  if (variantProps.value.length === 0) {
    return [{
      label: 'Default',
      props: safeBaseProps.value
    }];
  }
  
  const result: Array<{ label: string; props: Record<string, any> }> = [];
  
  variantProps.value.forEach((prop) => {
    let variants: any[] = [];

    if (prop.type?.toLowerCase() === 'boolean') {
      variants = [true, false];
    } else if (prop.values) {
      variants = prop.values.map((v) => v.replace(/^['"]|['"]$/g, ''));
    } else if (prop.type.includes('|')) {
      variants = prop.type.split('|').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
    }

    variants.forEach((val) => {
      result.push({
        label: `${prop.name}: ${val}`,
        props: { 
          ...safeBaseProps.value, // Используем безопасные пропсы с заглушками!
          [prop.name]: val
        }
      });
    });
  });

  return result;
});
</script>

<template>
  <div class="w-full h-full flex flex-col bg-gray-900">
    
    <!-- Info Banner -->
    <div v-if="isUsingFallback && matrixData.length > 1" class="flex-none p-2 bg-yellow-900/20 border-b border-yellow-900/30 text-yellow-200 text-xs text-center">
      ⚠️ Showing Story Wrappers. To see clean components in Matrix, export <code class="bg-yellow-900/30 px-1 py-0.5 rounded">const component</code> from your story file.
    </div>

    <div class="flex-1 overflow-y-auto p-10 custom-scrollbar">
      <!-- Matrix Grid -->
      <div class="grid gap-12 pb-20">
        <div v-for="(item, idx) in matrixData" :key="idx" class="space-y-4">
          <!-- Header -->
          <div class="flex items-center gap-4">
            <div class="px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded text-xs font-mono text-indigo-300 font-bold uppercase tracking-wider whitespace-nowrap">
              {{ item.label }}
            </div>
            <div class="h-px bg-gray-800 w-full"></div>
          </div>

          <!-- Render Container -->
          <!-- items-start: прижимает к верху, чтобы высота не прыгала -->
          <!-- w-full: чтобы занимал всю ширину -->
          <div class="p-8 border border-gray-800 border-dashed rounded-xl bg-[#0f0f0f] flex flex-col items-center justify-center min-h-[120px] relative transition-colors hover:border-gray-700 hover:bg-[#151515]">
            <UniversalRenderer :component="componentToRender" :component-props="item.props" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

