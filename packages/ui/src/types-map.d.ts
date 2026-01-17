import type * as Components from './index';
import type { AllowedComponentProps, ComponentCustomProps, VNodeProps } from 'vue';

// 1. Утилита: PascalCase -> kebab-case
// UButton -> button (префикс U мы уберем отдельно) -> u-button
type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? T extends Uncapitalize<T>
    ? `${Uncapitalize<C>}${KebabCase<T>}`
    : `${Uncapitalize<C>}-${KebabCase<T>}`
  : S;

// 2. Утилита: Получение чистого имени тега (UButton -> u-button)
type ToTagName<S extends string> = S extends `U${infer Rest}` 
  ? `u-${KebabCase<Rest>}` 
  : never;

// 3. Утилита: Вытаскиваем пропсы из Vue компонента
// InstanceType<T>['$props'] — это стандартный способ получения пропсов в Vue 3
type ExtractProps<T> = T extends new (...args: any) => any 
  ? InstanceType<T>['$props'] 
  : Record<string, never>;

// 4. Утилита: Очистка пропсов от служебных полей Vue и добавление HTML атрибутов
type ToWebComponentProps<T> = Partial<
  Omit<
    ExtractProps<T>,
    keyof AllowedComponentProps | keyof ComponentCustomProps | keyof VNodeProps
  >
> & {
  // Стандартные HTML атрибуты
  class?: string;
  className?: string; // React support
  style?: string | Record<string, string>;
  id?: string;
  slot?: string;
  ref?: any;
  children?: any;
  
  // Разрешаем любые события (onEvent)
  [key: `on${string}`]: any;
  // Разрешаем биндинги Svelte/Solid (attr:name)
  [key: string]: any;
};

// 5. ЭКСПОРТИРУЕМЫЙ ТИП
export type UDevToolsComponents = {
  [K in keyof typeof Components as ToTagName<string & K>]: ToWebComponentProps<typeof Components[K]>
};
