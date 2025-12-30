<script setup lang="ts">
import { computed } from 'vue';
import * as OutlineIcons from '@heroicons/vue/24/outline';
import * as SolidIcons from '@heroicons/vue/24/solid';

const props = defineProps<{
  name: string; // Например 'Home', 'Cog', 'XMark'
  size?: string;
  solid?: boolean;
}>();

const iconComponent = computed(() => {
  // Нормализуем имя: 'home' -> 'HomeIcon', 'HomeIcon' -> 'HomeIcon'
  let normalizedName = props.name;

  // Делаем первую букву заглавной
  normalizedName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);

  // Добавляем суффикс Icon, если его нет
  if (!normalizedName.endsWith('Icon')) {
    normalizedName += 'Icon';
  }

  const source = props.solid ? SolidIcons : OutlineIcons;
  // @ts-expect-error
  return source[normalizedName] || OutlineIcons.QuestionMarkCircleIcon;
});

const sizeClass = computed(() => {
  if (!props.size) return 'w-5 h-5';
  // Если передан класс tailwind (w-6 h-6), возвращаем как есть
  if (props.size.includes('w-')) return props.size;
  // Иначе интерпретируем как px (для обратной совместимости)
  return `w-[${props.size}] h-[${props.size}]`;
});
</script>

<template>
  <component 
    :is="iconComponent" 
    :class="[sizeClass, 'inline-block flex-shrink-0']" 
  />
</template>
