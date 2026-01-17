import { ref, shallowRef, watch } from 'vue';
import { useApi, useBridge } from '../../context';
import type { StoryFile, ComponentMeta, ComponentPropsMeta } from '../../types';

// Хелпер для безопасного парсинга значений из строк (docgen возвращает строки)
function parseDefaultValue(type: string, value?: string): any {
  if (value === undefined || value === null) return undefined;
  
  // Очистка от лишних кавычек, если они есть
  const cleanValue = value.toString().trim();

  if (type === 'Boolean') {
    return cleanValue === 'true';
  }
  
  if (type === 'Number') {
    const num = Number(cleanValue);
    return Number.isNaN(num) ? undefined : num;
  }

  if (type === 'Array' || type === 'Object') {
    try {
      // Пытаемся распарсить JSON, заменяя одинарные кавычки на двойные (частый кейс в JS объектах)
      // Это примитивный подход, но для простых дефолтов работает
      return JSON.parse(cleanValue.replace(/'/g, '"'));
    } catch {
      return undefined; // Если не вышло, оставляем пустым, чтобы не сломать UI
    }
  }

  // Для строк удаляем кавычки по краям: "'blue'" -> "blue"
  if (type === 'String') {
    return cleanValue.replace(/^['"]|['"]$/g, '');
  }

  return cleanValue;
}

// Хелпер для генерации заглушек для обязательных пропсов без дефолта
function getPlaceholderValue(type: string, name: string): any {
  const t = type.toLowerCase();
  
  if (t.includes('string')) {
    // Делаем заглушку чуть умнее на основе имени
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
  if (t.includes('function') || t.includes('func')) return () => {};
  
  return undefined;
}

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function useStorySelection() {
  const api = useApi();
  const bridge = useBridge();

  const selectedFile = ref<StoryFile | null>(null);
  const meta = ref<ComponentMeta | null>(null);
  const sourceCode = ref('');
  const propValues = ref<Record<string, any>>({});
  const isStoryLoading = ref(false);
  const currentStoryComponent = shallowRef<any>(null); // Это сама стори (обертка)
  const currentTargetComponent = shallowRef<any>(null); // Это чистый компонент (экспорт)
  const componentPropsMeta = ref<ComponentPropsMeta | null>(null);
  const storyDocs = ref<string | null>(null); // HTML с классами, уже отрендеренный на сервере

  const selectStory = async (file: StoryFile) => {
    selectedFile.value = file;
    isStoryLoading.value = true;
    storyDocs.value = null; // Сброс перед загрузкой
    currentTargetComponent.value = null; // Сбрасываем перед загрузкой

    try {
      // 1. Tell App to render
      bridge.send('componentsbook:select-story', { path: file.path });

      // 2. Load Meta, Source & Docs
      const [metaData, source, resolvedPath, docsContent] = await Promise.all([
        api.rpc.call<ComponentMeta>('componentsbook:get-meta', { path: file.path }),
        api.rpc.call<string>('componentsbook:get-source', { path: file.path }),
        api.rpc.call<string>('componentsbook:get-story-path', { path: file.path }),
        api.rpc.call<string | null>('componentsbook:get-story-docs', { path: file.path }),
      ]);

      meta.value = metaData;
      sourceCode.value = source;
      storyDocs.value = docsContent;

      // 3. Load Component
      if (resolvedPath) {
        try {
          const module = await import(/* @vite-ignore */ resolvedPath);
          
          // Основной экспорт - это Стори (для вкладки Preview)
          currentStoryComponent.value = module.default;

          // Именованный экспорт 'component' - это Целевой компонент (для Matrix и PropsEditor)
          // В Vue файлах это делается через дополнительный блок <script>
          if (module.component) {
            currentTargetComponent.value = module.component;
          } else {
            // Если экспорта нет, Matrix будет использовать Стори как фоллбэк
            currentTargetComponent.value = null;
          }
        } catch (e) {
          console.warn('[componentsbook] Could not load story component:', e);
        }
      }

      // 4. Generate Props Meta & Defaults
      const metaObj: ComponentPropsMeta = {};
      const defaults: Record<string, any> = {};

      if (metaData.props) {
        metaData.props.forEach((p) => {
          // Приводим тип к нижнему регистру для надежной проверки
          const type = p.type ? p.type.toLowerCase() : '';

          // Определение типа UI контрола (Smarter detection)
          if (type.includes('boolean') || type.includes('bool')) {
             metaObj[p.name] = { fieldType: 'checkbox' };
          } 
          else if (type.includes('number') || type.includes('int') || type.includes('float')) {
             metaObj[p.name] = { fieldType: 'number' };
          } 
          else if (p.values && p.values.length > 0) {
             metaObj[p.name] = { fieldType: 'select', options: p.values };
          } 
          else if (type.includes('object') || type.includes('array') || type.includes('[]')) {
             metaObj[p.name] = { fieldType: 'json' };
          } 
          else {
             metaObj[p.name] = { fieldType: 'text' };
          }

          // Инициализация значений
          if (p.default) {
            defaults[p.name] = parseDefaultValue(p.type, p.default);
          } else if (p.required) {
            defaults[p.name] = getPlaceholderValue(p.type, p.name);
          }
        });
      }

      componentPropsMeta.value = Object.keys(metaObj).length > 0 ? metaObj : null;
      propValues.value = defaults;
    } catch (e) {
      console.error('[componentsbook] Error loading story:', e);
      api.notify('Failed to load story', 'error');
    } finally {
      isStoryLoading.value = false;
    }
  };

  // 5. Sync Props
  const debouncedPropUpdate = debounce((newProps: Record<string, any>) => {
    try {
      // Сериализация для передачи через bridge (удаление функций и циклических ссылок)
      const safeProps = JSON.parse(JSON.stringify(newProps, (key, value) => {
        if (typeof value === 'function') return undefined;
        if (value instanceof Node || value instanceof HTMLElement) return undefined;
        return value;
      }));
      bridge.send('componentsbook:update-props', { props: safeProps });
    } catch (e) {
      // Игнорируем ошибки сериализации
    }
  }, 50);

  watch(propValues, (newVal) => debouncedPropUpdate(newVal), { deep: true });

  return {
    selectedFile,
    meta,
    sourceCode,
    propValues,
    isStoryLoading,
    currentStoryComponent,
    currentTargetComponent, // <-- Экспортируем новое состояние
    componentPropsMeta,
    storyDocs,
    selectStory,
  };
}
