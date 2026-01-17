<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRepo } from '../../composables/useRepo';
import { useApi } from '../../context';
import { UEmpty, ULoading, UBadge, UIcon, UButton, UCodeBlock } from '@u-devtools/ui';

const repo = useRepo();
const api = useApi();
const content = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);
const truncated = ref(false);

const filePath = computed(() => {
  if (!repo.selectedFilePath.value) return null;
  const node = repo.nodes.value.find((n) => n.id === repo.selectedFilePath.value);
  return node ? node.relative_path : null;
});

const size = computed(() => {
  if (!repo.selectedFilePath.value) return 0;
  const node = repo.nodes.value.find((n) => n.id === repo.selectedFilePath.value);
  return node?.size || 0;
});

const language = computed(() => {
  if (!filePath.value) return 'text';
  
  // Handle files without extension
  const parts = filePath.value.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
  const fileName = parts[0]?.toLowerCase() || '';
  
  // Special files without extension
  const specialFiles: Record<string, string> = {
    'dockerfile': 'dockerfile',
    'makefile': 'makefile',
    'readme': 'markdown',
    'license': 'text',
    'changelog': 'markdown',
    '.gitignore': 'gitignore',
    '.gitattributes': 'gitattributes',
    '.env': 'dotenv',
  };
  
  if (specialFiles[fileName] || specialFiles[filePath.value]) {
    return specialFiles[fileName] || specialFiles[filePath.value] || 'text';
  }
  
  // By extension
  const langMap: Record<string, string> = {
    'ts': 'typescript',
    'js': 'javascript',
    'tsx': 'tsx',
    'jsx': 'jsx',
    'vue': 'vue',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'php': 'php',
    'rb': 'ruby',
    'sh': 'bash',
    'sql': 'sql',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'xml': 'xml',
  };
  return langMap[ext || ''] || 'text';
});

const lineCount = computed(() => {
  if (!content.value) return 0;
  return content.value.split('\n').length;
});

watch(
  () => repo.selectedFilePath.value,
  async (newPath) => {
    if (!newPath) {
      content.value = '';
      return;
    }

    loading.value = true;
    error.value = null;
    copied.value = false;

    try {
      const fileContent = await repo.readFile(newPath);
      
      // Check if file was changed while loading
      if (repo.selectedFilePath.value !== newPath) {
        return;
      }
      
      if (fileContent) {
        content.value = fileContent;
        truncated.value = fileContent.includes('--- TRUNCATED');
        error.value = null;
      } else {
        error.value = 'File content is empty or unavailable';
      }
    } catch (err) {
      // Check if file was changed while loading
      if (repo.selectedFilePath.value !== newPath) {
        return;
      }
      
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'string' 
        ? err 
        : 'Failed to read file';
      
      error.value = errorMessage;
      content.value = '';
      
      console.error('[repo2txt] FilePreview error:', {
        fileId: newPath,
        error: errorMessage,
        errorObject: err,
      });
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);

async function copyContent() {
  if (!content.value) return;

  try {
    await navigator.clipboard.writeText(content.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : 'Failed to copy content';
    
    console.error('[repo2txt] Failed to copy:', {
      error: errorMessage,
      errorObject: error,
      contentLength: content.value.length,
    });
    
    api.notify(`Failed to copy: ${errorMessage}`, 'error');
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 border-l border-gray-800">
    <!-- Empty State -->
    <div v-if="!filePath" class="flex flex-col items-center justify-center h-full text-gray-400">
      <UIcon name="FileText" class="w-16 h-16 mb-4 opacity-20" />
      <p class="text-sm font-medium">Select a file to view content</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="flex flex-col items-center justify-center h-full">
      <div class="flex flex-col items-center animate-pulse">
        <ULoading text="Reading file..." />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center justify-center h-full p-8">
      <div class="w-full max-w-md bg-red-900/20 p-4 rounded-lg border border-red-800 text-center">
        <div class="mx-auto w-10 h-10 bg-red-900/50 text-red-400 rounded-full flex items-center justify-center mb-3">
          <UIcon name="AlertCircle" class="w-6 h-6" />
        </div>
        <h3 class="text-sm font-bold text-red-300 mb-1">Unable to read file</h3>
        <p class="text-xs text-red-400">{{ error }}</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="h-full flex flex-col min-h-0">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 h-10 border-b border-gray-800 bg-gray-800/50 shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <span class="text-xs font-bold text-gray-200 truncate font-mono" :title="filePath">
            {{ filePath }}
          </span>
          <UBadge v-if="truncated" variant="warning" class="text-[9px] uppercase tracking-wide">Truncated</UBadge>
        </div>

        <div class="flex items-center gap-3 pl-2">
          <div class="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
            <span v-if="content">{{ lineCount }} lines</span>
            <span v-if="content" class="mx-1">·</span>
            <span>{{ formatFileSize(size) }}</span>
          </div>
          <div class="h-3 w-px bg-gray-600"></div>
          <UButton
            variant="ghost"
            size="sm"
            :icon="copied ? 'Check' : 'Copy'"
            :label="copied ? 'Copied!' : 'Copy'"
            :aria-label="copied ? 'Content copied' : 'Copy file content'"
            @click="copyContent"
          />
        </div>
      </div>

      <!-- Code Preview -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <UCodeBlock :code="content" :language="language" />
      </div>
    </div>
  </div>
</template>
