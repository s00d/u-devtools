<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed, shallowRef, watchEffect } from 'vue';
import { createHighlighter, type Highlighter } from 'shiki';
import ULoading from './ULoading.vue';

const props = withDefaults(
  defineProps<{
    language?: string;
    code?: string;
    theme?: string;
  }>(),
  {
    language: 'text',
    theme: 'nord',
  }
);

const slotCodeRef = ref<HTMLElement | null>(null);
const highlightedCode = ref('');
const highlighter = shallowRef<Highlighter | null>(null);
const isInitializing = ref(false);
const isHighlighting = ref(false);
const slotContent = ref('');

// Normalize language name for Shiki
const normalizedLanguage = computed(() => {
  if (!props.language) return 'text';

  const lang = props.language.toLowerCase();
  const aliases: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
    html: 'html',
    xml: 'html',
    vue: 'vue',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    sql: 'sql',
    go: 'go',
    rust: 'rust',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'csharp',
    php: 'php',
    swift: 'swift',
    kotlin: 'kotlin',
    dart: 'dart',
    diff: 'diff',
    docker: 'dockerfile',
    dockerfile: 'dockerfile',
    svg: 'xml', // SVG uses XML highlighting
  };

  return aliases[lang] || lang;
});

const needsHighlighting = computed(() => {
  return props.language && props.language !== 'text' && normalizedLanguage.value !== 'text';
});

// Track slot content
watchEffect(() => {
  if (slotCodeRef.value) {
    slotContent.value = slotCodeRef.value.textContent || '';
  }
});

// Initialize highlighter
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

  // Get code from prop or from slot
  let code = '';
  if (props.code) {
    code = props.code;
  } else {
    // Update slot content before reading
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

  // If highlighter is not initialized, initialize it
  if (!highlighter.value) {
    await initHighlighter();
  }

  // If language is text or highlighter is still not ready, show plain text
  if (lang === 'text' || !highlighter.value) {
    highlightedCode.value = code;
    isHighlighting.value = false;
    return;
  }

  try {
    // Check that language is loaded
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
    // Remove language-text class that Shiki may add, and replace with correct one
    // Also remove white background from inline styles
    highlightedCode.value = html
      .replace(/language-text/g, `language-${lang}`)
      .replace(/background[:\s]+#fff[^;]*;?/gi, '')
      .replace(/background[:\s]+white[^;]*;?/gi, '')
      .replace(/background[:\s]+rgb\(255,\s*255,\s*255\)[^;]*;?/gi, '')
      .replace(/background[:\s]+rgba\(255,\s*255,\s*255[^)]*\)[^;]*;?/gi, '');
  } catch (e) {
    console.warn(`[UCodeBlock] Failed to highlight code for language "${lang}":`, e);
    highlightedCode.value = code;
  } finally {
    isHighlighting.value = false;
  }
};

const isLoading = computed(() => isInitializing.value || isHighlighting.value);
const showHighlighted = computed(
  () => highlightedCode.value && !isLoading.value && needsHighlighting.value
);

onMounted(async () => {
  // Wait for slot to render
  await nextTick();
  if (needsHighlighting.value) {
    await initHighlighter();
  }
  await highlight();
});

// Track changes in props and slot content
watch(
  () => [props.language, props.code, props.theme, slotContent.value],
  async () => {
    await nextTick();
    if (needsHighlighting.value && !highlighter.value) {
      await initHighlighter();
    }
    await highlight();
  },
  { deep: true }
);
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
      class="p-4 overflow-auto flex-1 min-h-0 [&_pre]:bg-transparent! [&_pre]:m-0 [&_pre]:p-0 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:overflow-visible [&_code]:block [&_code]:w-full [&_code]:bg-transparent! [&_code]:p-0 [&_code]:m-0 [&_code]:font-inherit [&_code]:text-inherit [&_code]:leading-inherit [&_*]:bg-transparent! [&_*]:!bg-transparent"
      style="background: transparent !important;"
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
