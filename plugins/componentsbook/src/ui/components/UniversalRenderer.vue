<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps<{
  component: any;
  componentProps?: Record<string, any>;
}>();

const container = ref<HTMLElement | null>(null);
const error = ref<string | null>(null);

// Хранилище инстансов для очистки/обновления
let reactRoot: any = null;
let svelteInstance: any = null;
let solidDispose: (() => void) | null = null;

// Определение типа фреймворка
const detectFramework = (c: any): 'vue' | 'react' | 'svelte' | 'solid' | 'preact' | 'unknown' => {
  if (!c) return 'unknown';
  
  // Vue (Obj, Class, Functional)
  if (c.render || c.setup || c.__name || c.template || c.__file) return 'vue';
  
  // React (Symbol tag or Function returning JSX-like obj)
  if (c.$$typeof && String(c.$$typeof) === 'Symbol(react.element)') return 'react';
  if (c.$$typeof && String(c.$$typeof) === 'Symbol(react.forward_ref)') return 'react';
  if (c.$$typeof && String(c.$$typeof) === 'Symbol(react.memo)') return 'react';
  
  // Svelte 5 (function) / Svelte 4 (class)
  // Svelte 5 components are functions, but usually processed by vite-plugin-svelte
  if (c.prototype?.constructor?.name === 'SvelteComponent') return 'svelte';
  
  // Heuristic for React Functional Component vs others
  if (typeof c === 'function') {
    // Check for Preact
    if (c.displayName?.startsWith('Preact')) return 'preact';
    return 'react'; // Default safe bet for JSX ecosystem
  }

  return 'unknown';
};

const framework = ref<string>('vue');

// --- MOUNTING STRATEGIES ---

const mountReact = async (Comp: any, p: any) => {
  try {
    // Безопасный динамический импорт с проверкой наличия модулей
    let React: any;
    let ReactDOM: any;
    
    try {
      React = await import('react');
    } catch {
      error.value = 'React is not installed. Install "react" package to preview React components.';
      return;
    }
    
    try {
      // Пробуем импортировать react-dom/client (React 18+)
      ReactDOM = await import('react-dom/client');
    } catch {
      // Fallback на старый API (React 17)
      try {
        const ReactDOMLegacy = await import('react-dom');
        if (ReactDOMLegacy.default?.render && container.value) {
          // Используем старый API
          ReactDOMLegacy.default.render(React.createElement(Comp, p), container.value);
          return;
        }
      } catch {
        error.value = 'react-dom is not installed. Install "react-dom" package to preview React components.';
        return;
      }
    }
    
    if (!reactRoot && ReactDOM.createRoot && container.value) {
      reactRoot = ReactDOM.createRoot(container.value);
    }
    if (reactRoot) {
      reactRoot.render(React.createElement(Comp, p));
    }
  } catch (e: any) {
    error.value = `React mount failed. ${e.message || 'Unknown error'}`;
  }
};

const mountSvelte = async (Comp: any, p: any) => {
  try {
    // Cleanup previous
    if (svelteInstance) {
      // Svelte 4
      if (svelteInstance.$destroy) svelteInstance.$destroy();
      // Svelte 5 mount return value handling if needed
      svelteInstance = null;
    }
    
    // Check if Svelte 5 mount API exists
    try {
        // Dynamic import to avoid build errors if svelte is missing
        const svelteModule = await import('svelte');
        if (svelteModule.mount && container.value) {
           svelteInstance = svelteModule.mount(Comp, { target: container.value, props: p });
           // Svelte 5 doesn't have $set on the instance returned by mount usually, 
           // updates are handled via reactive state passed in.
           // For simplicity in this generic renderer, we might need full remount or use a wrapper.
           return;
        }
    } catch {}

    // Fallback to Svelte 4 style
    if (typeof Comp === 'function' && Comp.prototype && container.value) {
        svelteInstance = new Comp({ target: container.value, props: p });
    } else {
        error.value = "Unknown Svelte component version";
    }

  } catch (e: any) {
    error.value = `Svelte mount failed. ${e.message}`;
  }
};

const mountSolid = async (Comp: any, p: any) => {
  try {
    // Безопасный динамический импорт для опциональной зависимости
    let solidWeb: any;
    let solidJs: any;
    
    try {
      solidWeb = await import('solid-js/web');
    } catch {
      error.value = 'solid-js/web is not installed. Install "solid-js" package to preview SolidJS components.';
      return;
    }
    
    try {
      solidJs = await import('solid-js');
    } catch {
      error.value = 'solid-js is not installed. Install "solid-js" package to preview SolidJS components.';
      return;
    }

    if (solidDispose) solidDispose();
    
    if (container.value && solidWeb.render && solidJs.createComponent) {
      solidDispose = solidWeb.render(() => solidJs.createComponent(Comp, p), container.value);
    }
  } catch (e: any) {
    error.value = `SolidJS mount failed. ${e.message || 'Unknown error'}`;
  }
};

// --- MAIN LOGIC ---

const renderComponent = async () => {
  error.value = null;
  if (!container.value && framework.value !== 'vue') return;

  const currentFramework = detectFramework(props.component);
  framework.value = currentFramework;

  // Если это Vue, то <component :is> сделает всё сам
  if (currentFramework === 'vue') return;

  // Для остальных нужен контейнер
  if (!container.value) {
    await nextTick(); // Ждем рендера div ref="container"
  }

  if (currentFramework === 'react') {
    await mountReact(props.component, props.componentProps || {});
  } else if (currentFramework === 'svelte') {
    await mountSvelte(props.component, props.componentProps || {});
  } else if (currentFramework === 'solid') {
    await mountSolid(props.component, props.componentProps || {});
  } else {
    // Попытка рендера как React (частый кейс для JSX библиотек)
    await mountReact(props.component, props.componentProps || {});
  }
};

// --- WATCHERS ---

// При изменении пропсов стараемся обновить, а не пересоздать
watch(() => props.componentProps, async (newProps) => {
  if (framework.value === 'react' && reactRoot) {
    try {
      const React = await import('react');
      // ВАЖНО: newProps должен быть новым объектом, иначе React.memo может заблокировать апдейт
      // В MatrixView мы каждый раз создаем новый объект props: { ...baseProps, ... }, так что это ок.
      reactRoot.render(React.createElement(props.component, newProps || {}));
    } catch {
      // Если React не установлен, просто игнорируем обновление
    }
  } 
  else if (framework.value === 'svelte' && svelteInstance && svelteInstance.$set) {
    // Svelte 4 update
    svelteInstance.$set(newProps || {});
  }
  else if (framework.value === 'solid' || (framework.value === 'svelte' && !svelteInstance?.$set)) {
    // Для Solid и Svelte 5 проще пересоздать, если нет реактивной обертки
    // (для полноценной поддержки Solid нужна сложная обертка с createSignal)
    await renderComponent();
  }
}, { deep: true });

// При изменении самого компонента — полный ререндер
watch(() => props.component, () => {
  // Очистка старого
  if (reactRoot) { 
      // React 18: unmount is async usually, but we reuse root if possible
      // reactRoot.unmount(); reactRoot = null; 
      // Reuse root for smoother DX
  }
  if (svelteInstance?.$destroy) { svelteInstance.$destroy(); svelteInstance = null; }
  if (solidDispose) { solidDispose(); solidDispose = null; }
  
  if (container.value) container.value.innerHTML = '';
  
  renderComponent();
});

onMounted(renderComponent);

onUnmounted(() => {
  if (reactRoot) {
    reactRoot.unmount();
  }
  if (svelteInstance?.$destroy) {
    svelteInstance.$destroy();
  }
  if (solidDispose) {
    solidDispose();
  }
});
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/50 p-4 rounded text-red-200 text-sm m-4">
      <h3 class="font-bold mb-1">Renderer Error</h3>
      {{ error }}
    </div>

    <!-- Vue Native Render -->
    <component 
      v-if="framework === 'vue'" 
      :is="component" 
      v-bind="componentProps" 
    />
    
    <!-- Foreign Framework Container -->
    <div 
      v-else 
      ref="container" 
      class="w-full h-full" 
      data-udt-renderer="universal"
    ></div>
  </div>
</template>
