<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { RpcClientInterface } from '@u-devtools/core';
import { UButton, USelect, ULoading, UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  rpc: RpcClientInterface;
  notify: (msg: string) => void;
  openFile?: (file: string, line: number, column: number) => Promise<void>;
  onRegisterRefresh?: (fn: () => void) => void;
  storage?: { get: <T>(key: string, def: T) => T; set: <T>(key: string, value: T) => void };
}>();

interface FileData {
  content: unknown;
  locations: Record<string, { line: number; column: number }>;
}

const fileData = ref<Record<string, FileData>>({});
const activeFile = ref<string>('');
const loading = ref(false);
const editorContent = ref<string>('');
const isSaving = ref(false);

const translations = computed(() => {
  const result: Record<string, unknown> = {};
  for (const [file, data] of Object.entries(fileData.value)) {
    result[file] = data.content;
  }
  return result;
});

const locations = computed(() => {
  if (!activeFile.value || !fileData.value[activeFile.value]) {
    return {};
  }
  return fileData.value[activeFile.value].locations;
});

const fileOptions = computed(() => {
  return Object.keys(fileData.value).map((key) => ({
    label: key,
    value: key,
  }));
});

const loadData = async () => {
  loading.value = true;
  fileData.value = await props.rpc.call<Record<string, FileData>>('i18n:getData');

  const lastFile =
    (
      props.rpc as unknown as { storage?: { get: (key: string, def: string) => string } }
    ).storage?.get?.('lastFile', '') || '';

  if (lastFile && fileData.value[lastFile]) {
    activeFile.value = lastFile;
  } else if (!activeFile.value && Object.keys(fileData.value).length > 0) {
    activeFile.value = Object.keys(fileData.value)[0];
  }

  if (activeFile.value && fileData.value[activeFile.value]) {
    editorContent.value = JSON.stringify(fileData.value[activeFile.value].content, null, 2);
  }
  loading.value = false;
};

const save = async () => {
  if (!activeFile.value) return;
  isSaving.value = true;
  try {
    let parsedContent: unknown;
    try {
      parsedContent = JSON.parse(editorContent.value);
    } catch {
      props.notify('Invalid JSON format');
      isSaving.value = false;
      return;
    }

    await props.rpc.call('i18n:save', {
      file: activeFile.value,
      content: parsedContent,
    });
    if (fileData.value[activeFile.value]) {
      fileData.value[activeFile.value].content = parsedContent;
    }
    props.notify('Saved successfully!');
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.notify(`Error saving: ${error}`);
  } finally {
    isSaving.value = false;
  }
};

const onFileChange = () => {
  if (activeFile.value && fileData.value[activeFile.value]) {
    editorContent.value = JSON.stringify(fileData.value[activeFile.value].content, null, 2);
    if (props.storage) {
      props.storage.set('lastFile', activeFile.value);
    }
  } else {
    editorContent.value = '';
  }
};

const onEditorInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  editorContent.value = target.value;
};

const openInEditor = async (key: string) => {
  if (!activeFile.value || !props.openFile) return;
  const loc = locations.value[key];
  if (!loc) {
    props.notify(`Location not found for key: ${key}`);
    return;
  }

  try {
    await props.openFile(activeFile.value, loc.line, loc.column);
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.notify(`Failed to open file: ${error}`);
  }
};

onMounted(() => {
  loadData();
  if (props.onRegisterRefresh) {
    props.onRegisterRefresh(loadData);
  }
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Toolbar -->
    <div class="p-4 border-b flex justify-between items-center bg-gray-50">
      <div class="flex gap-2 items-center">
        <USelect
          v-model="activeFile"
          :options="fileOptions"
          placeholder="Select locale file"
          size="sm"
          @update:modelValue="onFileChange"
        />
        <UButton
          variant="ghost"
          icon="i-carbon-renew"
          size="sm"
          :disabled="loading"
          @click="loadData"
          title="Refresh"
        />
      </div>

      <UButton variant="primary" icon="i-carbon-save" :loading="isSaving" @click="save">
        Save Changes
      </UButton>
    </div>

    <!-- Editor Area -->
    <div class="flex-1 overflow-auto p-4" v-if="activeFile && !loading">
      <div class="mb-2 flex gap-2 flex-wrap">
        <UButton
          v-for="(loc, key) in locations"
          :key="key"
          variant="ghost"
          size="sm"
          icon="i-carbon-document"
          @click="openInEditor(key)"
          :title="`Open ${key} in editor (line ${loc.line})`"
        >
          {{ key }}
        </UButton>
      </div>
      <textarea
        class="w-full h-full font-mono text-sm p-4 border rounded focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        :value="editorContent"
        @input="onEditorInput"
      ></textarea>
    </div>
    <ULoading v-else-if="loading" text="Loading translations..." />
    <UEmpty v-else icon="i-carbon-document" title="No file selected" description="Select a locale file from the dropdown above" />
  </div>
</template>
