<script setup lang="ts">
import { useRepo } from '../../composables/useRepo';
import { useApi } from '../../context';
import { UModal, UCodeBlock, UButton } from '@u-devtools/ui';

defineProps<{
  visible: boolean;
  content: {
    success: boolean;
    message: string;
    content?: string;
    isTruncated?: boolean;
  } | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

const repo = useRepo();
const api = useApi();

function closeModal() {
  emit('close');
}

async function handleCopyToClipboard() {
  await repo.copyFromCache();
}

async function handleDownloadMarkdown() {
  try {
    const result = await repo.api.rpc.call<{ content: string }>('repo2txt:copy-from-cache', {
      rootPath: repo.rootPath.value,
    });

    const blob = new Blob([result.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    api.notify('Markdown file downloaded', 'success');
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'string' 
      ? error 
      : 'Failed to download markdown';
    
    console.error('[repo2txt] Download error:', {
      error: errorMessage,
      errorObject: error,
    });
    
    api.notify(`Failed to download: ${errorMessage}`, 'error');
  }
}
</script>

<template>
  <UModal
    :visible="visible"
    :title="content?.success ? 'Generation Complete' : 'Error'"
    size="lg"
    @close="closeModal"
  >
    <div class="flex flex-col max-h-[60vh] w-full overflow-hidden">
      <!-- Status Header -->
      <div v-if="content?.success" class="mb-3">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-300">{{ content.message }}</p>
          <div class="flex items-center gap-2">
            <UButton
              variant="secondary"
              size="sm"
              icon="ArrowDownOnRectangle"
              label="Download MD"
              @click="handleDownloadMarkdown"
            />
            <UButton
              variant="secondary"
              size="sm"
              icon="Copy"
              label="Copy Full"
              @click="handleCopyToClipboard"
            />
          </div>
        </div>
        <div v-if="content.isTruncated" class="mt-1 text-xs text-amber-500">
          Preview: First 50KB (use "Copy Full" for complete content)
        </div>
      </div>
      <div v-else class="mb-3 text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800">
        {{ content?.message || 'Unknown error occurred' }}
      </div>

      <!-- Preview Body -->
      <div v-if="content?.success && content?.content" class="flex-1 flex flex-col min-h-0 overflow-hidden border-t border-gray-700 pt-3">
        <div class="flex-1 min-h-0 overflow-auto">
          <UCodeBlock
            :code="content.content"
            language="markdown"
          />
        </div>
      </div>
    </div>
  </UModal>
</template>
