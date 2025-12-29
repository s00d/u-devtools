<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed, shallowRef, watchEffect } from 'vue';
import { createHighlighter, type Highlighter } from 'shiki';
import ULoading from './ULoading.vue';

const props = withDefaults(defineProps<{
  language?: string;
  code?: string;
  theme?: string;
}>(), {
  language: 'text',
  theme: 'nord',
});

const slotCodeRef = ref<HTMLElement | null>(null);
const highlightedCode = ref('');
const highlighter = shallowRef<Highlighter | null>(null);
const isInitializing = ref(false);
const isHighlighting = ref(false);
const slotContent = ref('');

// Нормализация имени языка для Shiki
const normalizedLanguage = computed(() => {
  if (!props.language) return 'text';
  
  const lang = props.language.toLowerCase();
  const aliases: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'html': 'html',
    'xml': 'html',
    'vue': 'vue',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'sql': 'sql',
    'go': 'go',
    'rust': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'csharp': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'dart': 'dart',
    'diff': 'diff',
    'docker': 'dockerfile',
    'dockerfile': 'dockerfile',
    'svg': 'xml', // SVG использует XML подсветку
  };
  
  return aliases[lang] || lang;
});

const needsHighlighting = computed(() => {
  return props.language && props.language !== 'text' && normalizedLanguage.value !== 'text';
});

// Отслеживание содержимого слота
watchEffect(() => {
  if (slotCodeRef.value) {
    slotContent.value = slotCodeRef.value.textContent || '';
  }
});

// Инициализация highlighter
const initHighlighter = async () => {
  if (highlighter.value || isInitializing.value) return;
  
  isInitializing.value = true;
  try {
    highlighter.value = await createHighlighter({
      themes: [props.theme],
      langs: [
        'javascript',
        'typescript',
        'jsx',
        'tsx',
        'json',
        'css',
        'html',
        'bash',
        'yaml',
        'markdown',
        'sql',
        'python',
        'java',
        'c',
        'cpp',
        'csharp',
        'php',
        'ruby',
        'go',
        'rust',
        'swift',
        'kotlin',
        'dart',
        'vue',
        'sass',
        'scss',
        'less',
        'stylus',
        'diff',
        'dockerfile',
        'xml',
      ],
    });
  } catch (e) {
    console.error('[UCodeBlock] Failed to initialize highlighter:', e);
  } finally {
    isInitializing.value = false;
  }
};

const highlight = async () => {
  if (!needsHighlighting.value) {
    highlightedCode.value = '';
    isHighlighting.value = false;
    return;
  }

  isHighlighting.value = true;
  await nextTick();
  
  // Получаем код из prop или из слота
  let code = '';
  if (props.code) {
    code = props.code;
  } else {
    // Обновляем содержимое слота перед чтением
    if (slotCodeRef.value) {
      slotContent.value = slotCodeRef.value.textContent || '';
    }
    code = slotContent.value;
  }
  
  if (!code || !code.trim()) {
    highlightedCode.value = '';
    isHighlighting.value = false;
    return;
  }

  const lang = normalizedLanguage.value;

  // Если highlighter не инициализирован, инициализируем его
  if (!highlighter.value) {
    await initHighlighter();
  }

  // Если язык text или highlighter все еще не готов, показываем обычный текст
  if (lang === 'text' || !highlighter.value) {
    highlightedCode.value = code;
    isHighlighting.value = false;
    return;
  }

  try {
    // Проверяем, что язык загружен
    const loadedLangs = highlighter.value.getLoadedLanguages();
    if (!loadedLangs.includes(lang)) {
      console.warn(`[UCodeBlock] Language "${lang}" is not loaded. Available:`, loadedLangs);
      highlightedCode.value = code;
      isHighlighting.value = false;
      return;
    }

    const html = highlighter.value.codeToHtml(code.trim(), {
      lang,
      theme: props.theme,
    });
    // Убираем language-text класс, который Shiki может добавить, и заменяем на правильный
    highlightedCode.value = html.replace(/language-text/g, `language-${lang}`);
  } catch (e) {
    console.warn(`[UCodeBlock] Failed to highlight code for language "${lang}":`, e);
    highlightedCode.value = code;
  } finally {
    isHighlighting.value = false;
  }
};

const isLoading = computed(() => isInitializing.value || isHighlighting.value);
const showHighlighted = computed(() => highlightedCode.value && !isLoading.value && needsHighlighting.value);

onMounted(async () => {
  // Ждем, чтобы slot успел отрендериться
  await nextTick();
  if (needsHighlighting.value) {
    await initHighlighter();
  }
  await highlight();
});

// Отслеживаем изменения в props и содержимом слота
watch(() => [props.language, props.code, props.theme, slotContent.value], async () => {
  await nextTick();
  if (needsHighlighting.value && !highlighter.value) {
    await initHighlighter();
  }
  await highlight();
}, { deep: true });
</script>

<template>
  <div class="relative group bg-gray-950 rounded-md overflow-hidden text-gray-200 font-mono text-sm border border-gray-800 flex flex-col h-full w-full">
    <!-- Header with language badge and actions -->
    <div
      v-if="language && language !== 'text'"
      class="flex items-center justify-between px-3 py-2 bg-gray-900/50 border-b border-gray-800 flex-shrink-0"
    >
      <div class="px-2 py-0.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {{ normalizedLanguage }}
      </div>
      <div class="opacity-0 group-hover:opacity-100 transition">
        <slot name="actions" />
      </div>
    </div>
    
    <!-- Actions without header -->
    <div
      v-else
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10"
    >
      <slot name="actions" />
    </div>
    
    <!-- Loader -->
    <div
      v-if="isLoading && needsHighlighting"
      class="flex items-center justify-center p-8 min-h-[100px] flex-1 overflow-hidden"
    >
      <ULoading />
    </div>
    
    <!-- Highlighted code -->
    <div
      v-else-if="showHighlighted"
      class="shiki-container p-4 overflow-auto flex-1 min-h-0"
      v-html="highlightedCode"
    />
    
    <!-- Plain code (fallback) -->
    <pre
      v-else
      class="whitespace-pre-wrap break-all p-4 overflow-auto flex-1 min-h-0 m-0"
    >
      <code
        ref="slotCodeRef"
        class="language-text m-0 p-0"
      >
        <slot />
      </code>
    </pre>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* Стили для Shiki */
:deep(.shiki-container) {
  background: transparent;
}

:deep(.shiki-container pre) {
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow: visible;
  text-indent: 0 !important;
}

:deep(.shiki-container code) {
  display: block;
  width: 100%;
  background: transparent;
  padding: 0 !important;
  margin: 0 !important;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  text-indent: 0 !important;
}

/* Убираем лишние обертки от Shiki */
:deep(.shiki-container > pre) {
  background: transparent !important;
  margin: 0 !important;
  padding: 0 !important;
  text-indent: 0 !important;
}

/* Убираем отступы у pre и code */
pre {
  margin: 0;
  padding: 0;
  text-indent: 0;
}

code {
  margin: 0;
  padding: 0;
  text-indent: 0;
}

/* Убираем дефолтные отступы браузера */
.shiki-container pre code,
.shiki-container pre {
  text-indent: 0 !important;
  padding-left: 0 !important;
  margin-left: 0 !important;
}
</style>
