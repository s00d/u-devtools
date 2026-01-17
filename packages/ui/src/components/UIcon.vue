<script setup lang="ts">
import { computed } from 'vue';
import { tv } from 'tailwind-variants';
import * as OutlineIcons from '@heroicons/vue/24/outline';
import * as SolidIcons from '@heroicons/vue/24/solid';

const props = defineProps<{
  name: string; // Например 'Home', 'Cog', 'XMark'
  size?: string;
  solid?: boolean;
}>();

const iconComponent = computed(() => {
  // Проверяем, что name передан и не пустой
  if (!props.name || typeof props.name !== 'string') {
    return OutlineIcons.QuestionMarkCircleIcon;
  }

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

const icon = tv({
  base: 'inline-block flex-shrink-0',
});

const sizeClass = computed(() => {
  if (!props.size) return icon() + ' w-5 h-5';
  // Если передан класс tailwind (w-6 h-6), возвращаем как есть
  if (props.size.includes('w-')) return icon() + ' ' + props.size;
  // Иначе интерпретируем как px (для обратной совместимости)
  return icon() + ` w-[${props.size}] h-[${props.size}]`;
});
</script>

<template>
  <component 
    :is="iconComponent" 
    :class="sizeClass" 
  />
</template>
