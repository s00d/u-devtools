<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { USplitter, UButton, UIcon, UInput, UModal, ULoading, UEmpty } from '@u-devtools/ui';
import { flattenTranslations, unflattenTranslations } from '../util/i18nUtils';
import type { TranslationContent, LocaleData, TreeNode, ModuleOptions } from '../types';
import { Translator, type DriverType } from '../util/Translator';
import FileTreeView from './FileTreeView.vue';

const props = defineProps<{
  api: ClientApi;
  onRegisterRefresh?: (fn: () => void) => void;
}>();

// State
const isLoading = ref(true);
const locales = ref<LocaleData>({});
const configs = ref<ModuleOptions>({});
const selectedFile = ref('');
const selectedFileContent = ref<TranslationContent>({});
const localContent = ref<TranslationContent>({});
const searchQuery = ref('');
const currentPage = ref(1);
const isStatisticsModalVisible = ref(false);
const isSaving = ref(false);
const isTranslating = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

// Translation settings (from plugin settings)
const selectedDriver = computed(() => props.api.settings.get<DriverType>('translationDriver', 'disabled'));
const apiToken = computed(() => props.api.settings.get<string>('translationApiToken', ''));
const driverOptions = computed(() => ({
  folderId: props.api.settings.get<string>('translationFolderId', ''),
  formality: props.api.settings.get<string>('translationFormality', 'default'),
  model: props.api.settings.get<string>('translationModel', 'gpt-3.5-turbo'),
}));

// Settings
const itemsPerPage = computed(() => props.api.settings.get<number>('itemsPerPage', 30));

// Computed
const flattenedContent = computed(() => flattenTranslations(localContent.value));
const defaultLocaleFlatContent = computed(() => {
  const defaultContent = getDefaultLocaleTranslation();
  return flattenTranslations(defaultContent);
});

const filteredKeys = computed(() => {
  const keys = Object.keys(defaultLocaleFlatContent.value);
  if (!searchQuery.value.trim()) return paginatedKeys.value;

  const query = searchQuery.value.toLowerCase();
  return keys.filter(
    (key) =>
      key.toLowerCase().includes(query) ||
      defaultLocaleFlatContent.value[key]?.toLowerCase().includes(query) ||
      flattenedContent.value[key]?.toLowerCase().includes(query)
  );
});

const totalPages = computed(() => {
  return Math.ceil(Object.keys(defaultLocaleFlatContent.value).length / itemsPerPage.value);
});

const paginatedKeys = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return Object.keys(defaultLocaleFlatContent.value).slice(start, end);
});

// Tree structure for file list
const tree = computed<TreeNode[]>(() => {
  const filePaths = Object.keys(locales.value);
  if (filePaths.length === 0) return [];

  const commonPrefix = findCommonPrefix(filePaths);
  const root: TreeNode = {
    name: extractName(commonPrefix) || '/',
    fullPath: commonPrefix || '/',
    isFile: false,
    children: [],
  };

  filePaths.forEach((filePath) => {
    const relativePath = filePath.startsWith(commonPrefix)
      ? filePath.slice(commonPrefix.length).split('/').filter(Boolean)
      : filePath.split('/').filter(Boolean);

    let current = root;
    for (let index = 0; index < relativePath.length; index++) {
      const part = relativePath[index];
      if (!part) continue;
      const isFile = index === relativePath.length - 1;

      let child = current.children.find((node) => node.name === part);
      if (!child) {
        child = {
          name: part,
          fullPath: `${current.fullPath}/${part}`.replace(/\/+/g, '/'),
          isFile,
          children: [],
        };
        current.children.push(child);
      }
      current = child;
    }
  });

  const sortTree = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
      return a.isFile ? 1 : -1;
    });
    for (const node of nodes) {
      sortTree(node.children);
    }
  };

  sortTree(root.children);
  return root.children;
});

// Statistics
const statistics = computed(() => {
  const flat = flattenedContent.value;
  const defaultFlat = defaultLocaleFlatContent.value;
  const totalKeys = Object.keys(defaultFlat).length;
  const translatedKeys = Object.values(flat).filter((v) => v?.trim()).length;
  const percentage = totalKeys ? ((translatedKeys / totalKeys) * 100).toFixed(2) : '0.00';
  const missingKeys = totalKeys - translatedKeys;

  return {
    totalKeys,
    translatedKeys,
    percentage,
    missingKeys,
  };
});

// Methods
function findCommonPrefix(files: string[]): string {
  if (files.length === 0) return '';
  const paths = files.map((p) => p.split('/'));
  const commonSegments: string[] = [];
  const maxDepth = Math.min(...paths.map((p) => p.length));

  for (let i = 0; i < maxDepth; i++) {
    const segment = paths[0]?.[i];
    if (segment && paths.every((p) => p[i] === segment)) {
      commonSegments.push(segment);
    } else {
      break;
    }
  }

  return commonSegments.join('/');
}

function extractName(path: string): string {
  const parts = path.split('/').filter((p) => p);
  return parts[parts.length - 1] || '';
}

function handleFileSelected(fullPath: string) {
  const normalizedPath = fullPath.replace(/^\/+/, '').replace(/\\/g, '/');
  selectedFile.value = fullPath;

  let content = locales.value[normalizedPath];
  if (!content) {
    content = locales.value[fullPath];
  }
  if (!content && fullPath.startsWith('/')) {
    content = locales.value[fullPath.slice(1)];
  }

  if (content) {
    selectedFileContent.value = { ...content };
    localContent.value = { ...content };
  } else {
    selectedFileContent.value = {};
    localContent.value = {};
  }
  currentPage.value = 1;
}

function getDefaultLocaleTranslation(): TranslationContent {
  const defaultLocale = configs.value.defaultLocale || 'en';
  if (!defaultLocale) return {};

  const normalizedSelected = selectedFile.value.replace(/^\/+/, '').replace(/\\/g, '/');
  const currentFileName = normalizedSelected.split('/').pop() ?? '';
  const defaultFileName = currentFileName.replace(/^[^.]*\./, `${defaultLocale}.`);

  let defaultContent = locales.value[defaultFileName];
  if (!defaultContent) {
    defaultContent = locales.value[`/${defaultFileName}`];
  }
  if (!defaultContent) {
    const defaultLocaleKey = Object.keys(locales.value).find((key) =>
      key.includes(`${defaultLocale}.json`) || key.endsWith(`/${defaultLocale}.json`)
    );
    if (defaultLocaleKey) {
      defaultContent = locales.value[defaultLocaleKey];
    }
  }

  return defaultContent ?? {};
}

async function loadData() {
  isLoading.value = true;
  try {
    const [localesData, configsData] = await Promise.all([
      props.api.rpc.call<LocaleData>('i18n:getLocalesAndTranslations'),
      props.api.rpc.call<ModuleOptions>('i18n:getConfigs'),
    ]);

    locales.value = localesData;
    configs.value = configsData;

    if (selectedFile.value && locales.value[selectedFile.value]) {
      selectedFileContent.value = { ...locales.value[selectedFile.value] };
      localContent.value = { ...locales.value[selectedFile.value] };
    }
  } catch (e) {
    props.api.notify(`Failed to load data: ${e}`, 'error');
  } finally {
    isLoading.value = false;
  }
}

async function handleSave() {
  if (!selectedFile.value) return;
  isSaving.value = true;
  try {
    await props.api.rpc.call('i18n:saveTranslation', {
      filePath: selectedFile.value,
      content: localContent.value,
    });
    selectedFileContent.value = { ...localContent.value };
    locales.value[selectedFile.value] = { ...localContent.value };
    props.api.notify('Saved successfully!', 'success');
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.api.notify(`Error saving: ${error}`, 'error');
  } finally {
    isSaving.value = false;
  }
}

function exportTranslations() {
  const blob = new Blob([JSON.stringify(localContent.value, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = selectedFile.value.split('/').pop() || 'translations.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importTranslations(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          localContent.value = JSON.parse(e.target?.result as string);
        } catch {
          props.api.notify('Invalid JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
  }
}

function handleInputChange(key: string, value: string) {
  const flat = { ...flattenedContent.value };
  flat[key] = value;
  localContent.value = unflattenTranslations(flat);
}

// Translation functions
async function translateKey(key: string) {
  if (selectedDriver.value === 'disabled' || !apiToken.value) {
    props.api.notify('Translation service is not configured. Please configure it in Settings.', 'error');
    return;
  }

  const defaultText = defaultLocaleFlatContent.value[key];
  if (!defaultText) {
    props.api.notify('No default value found for this key', 'error');
    return;
  }

  try {
    const fromLang = configs.value.defaultLocale || 'en';
    const fileName = selectedFile.value.split('/').pop() || '';
    const toLang = fileName.replace('.json', '').split('.').pop() || 'en';

    const translator = new Translator({
      apiKey: apiToken.value,
      driver: selectedDriver.value,
      options: driverOptions.value,
    });

    const translated = await translator.translate(defaultText, fromLang, toLang);
    handleInputChange(key, translated);
    props.api.notify('Translation completed', 'success');
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.api.notify(`Translation error: ${error}`, 'error');
  }
}

async function translateMissingKeys() {
  if (selectedDriver.value === 'disabled' || !apiToken.value) {
    props.api.notify('Translation service is not configured. Please configure it in Settings.', 'error');
    return;
  }

  const defaultFlat = defaultLocaleFlatContent.value;
  const currentFlat = flattenedContent.value;
  const missingKeys = Object.keys(defaultFlat).filter(
    (key) => !currentFlat[key] || !currentFlat[key].trim()
  );

  if (missingKeys.length === 0) {
    props.api.notify('No missing translations', 'info');
    return;
  }

  if (!confirm(`Translate ${missingKeys.length} missing keys?`)) {
    return;
  }

  isTranslating.value = true;
  try {
    const fromLang = configs.value.defaultLocale || 'en';
    const fileName = selectedFile.value.split('/').pop() || '';
    const toLang = fileName.replace('.json', '').split('.').pop() || 'en';

    const translator = new Translator({
      apiKey: apiToken.value,
      driver: selectedDriver.value,
      options: driverOptions.value,
    });

    const flat = { ...currentFlat };
    for (const key of missingKeys) {
      const text = defaultFlat[key];
      if (text) {
        try {
          flat[key] = await translator.translate(text, fromLang, toLang);
        } catch (e) {
          console.error(`Failed to translate key ${key}:`, e);
        }
      }
    }

    localContent.value = unflattenTranslations(flat);
    props.api.notify(`Translated ${missingKeys.length} keys`, 'success');
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    props.api.notify(`Translation error: ${error}`, 'error');
  } finally {
    isTranslating.value = false;
  }
}

// Watch for updates from server
let unsubscribe: (() => void) | undefined;

onMounted(() => {
  loadData();
  if (props.onRegisterRefresh) {
    props.onRegisterRefresh(loadData);
  }

  // Subscribe to locale updates
  unsubscribe = props.api.rpc.on('i18n:localesUpdate', (data: unknown) => {
    locales.value = data as LocaleData;
    if (selectedFile.value && locales.value[selectedFile.value]) {
      selectedFileContent.value = { ...locales.value[selectedFile.value] };
      localContent.value = { ...locales.value[selectedFile.value] };
    }
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

watch(selectedFileContent, (newContent) => {
  if (newContent) {
    localContent.value = { ...newContent };
  }
});
</script>

<template>
  <div class="h-full flex flex-col bg-[#111827] text-gray-200 overflow-hidden">
    <ULoading v-if="isLoading" fullscreen />

    <USplitter v-else :default-size="280" :min="150">
      <template #left>
        <!-- Locales List -->
        <FileTreeView
          :tree="tree"
          :selected-file="selectedFile"
          @file-selected="handleFileSelected"
        />
      </template>

      <template #right>
        <div v-if="selectedFile" class="h-full flex flex-col bg-[#111827]">
          <!-- Header -->
          <div class="flex-none border-b border-gray-700 bg-gray-800 p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm">
                <UIcon name="DocumentText" class="w-4 h-4 text-gray-400" />
                <span class="font-mono text-gray-300">{{ selectedFile }}</span>
              </div>
              <div class="flex gap-2">
                <UButton
                  variant="ghost"
                  size="sm"
                  icon="ArrowDownTray"
                  @click="exportTranslations"
                  title="Export"
                />
                <label>
                  <input
                    ref="fileInput"
                    type="file"
                    accept=".json"
                    class="hidden"
                    @change="importTranslations"
                  />
                  <UButton
                    variant="ghost"
                    size="sm"
                    icon="ArrowUpTray"
                    @click="fileInput?.click()"
                    title="Import"
                  />
                </label>
                <UButton
                  v-if="selectedDriver !== 'disabled'"
                  variant="ghost"
                  size="sm"
                  icon="Language"
                  :loading="isTranslating"
                  @click="translateMissingKeys"
                  title="Translate Missing Keys"
                />
                <UButton
                  variant="ghost"
                  size="sm"
                  icon="ChartBar"
                  @click="isStatisticsModalVisible = true"
                  title="Statistics"
                />
                <UButton
                  variant="primary"
                  size="sm"
                  icon="Check"
                  :loading="isSaving"
                  @click="handleSave"
                >
                  Save
                </UButton>
              </div>
            </div>
          </div>

          <!-- Editor -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Search -->
            <div class="flex-none p-2 border-b border-gray-700 bg-gray-800">
              <UInput
                v-model="searchQuery"
                placeholder="Search keys or values..."
                size="sm"
              />
            </div>

            <!-- Translation List -->
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-for="key in filteredKeys"
                :key="key"
                class="p-3 bg-gray-800 rounded border border-gray-700"
                :class="{ 'border-l-4 border-l-yellow-500': !flattenedContent[key]?.trim() }"
              >
                <div class="flex justify-between items-center mb-1">
                  <span class="font-mono text-xs font-semibold text-gray-300 truncate select-all">
                    {{ key }}
                  </span>
                  <UButton
                    v-if="selectedDriver !== 'disabled' && defaultLocaleFlatContent[key]"
                    variant="ghost"
                    size="sm"
                    icon="Language"
                    @click="translateKey(key)"
                    title="Translate from default locale"
                    class="ml-2"
                  />
                </div>
                <div class="text-xs text-gray-500 mb-2 truncate opacity-80">
                  {{ defaultLocaleFlatContent[key] || 'No default value' }}
                </div>
                <textarea
                  :value="flattenedContent[key] || ''"
                  class="w-full p-2 border border-gray-600 rounded text-sm min-h-[38px] bg-gray-900 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  :placeholder="defaultLocaleFlatContent[key]"
                  rows="1"
                  @input="(e) => handleInputChange(key, (e.target as HTMLTextAreaElement).value)"
                />
              </div>
            </div>

            <!-- Pagination -->
            <div
              v-if="!searchQuery && totalPages > 1"
              class="flex-none p-2 border-t border-gray-700 bg-gray-800 flex items-center justify-center gap-2"
            >
              <UButton
                variant="ghost"
                size="sm"
                icon="ChevronLeft"
                :disabled="currentPage === 1"
                @click="currentPage--"
              />
              <span class="text-sm text-gray-400">
                Page {{ currentPage }} of {{ totalPages }}
              </span>
              <UButton
                variant="ghost"
                size="sm"
                icon="ChevronRight"
                :disabled="currentPage === totalPages"
                @click="currentPage++"
              />
            </div>
          </div>
        </div>

        <div v-else class="h-full flex items-center justify-center text-gray-400">
          <UEmpty
            icon="DocumentText"
            title="No file selected"
            description="Select a locale file from the tree to edit"
          />
        </div>
      </template>
    </USplitter>

    <!-- Statistics Modal -->
    <UModal :visible="isStatisticsModalVisible" title="Statistics" @close="isStatisticsModalVisible = false">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-gray-800 rounded border border-gray-700">
            <div class="text-sm text-gray-400 mb-1">Total Keys</div>
            <div class="text-2xl font-bold text-indigo-400">{{ statistics.totalKeys }}</div>
          </div>
          <div class="p-3 bg-gray-800 rounded border border-gray-700">
            <div class="text-sm text-gray-400 mb-1">Translated</div>
            <div class="text-2xl font-bold text-green-400">
              {{ statistics.translatedKeys }} ({{ statistics.percentage }}%)
            </div>
          </div>
          <div class="p-3 bg-gray-800 rounded border border-gray-700">
            <div class="text-sm text-gray-400 mb-1">Missing</div>
            <div class="text-2xl font-bold text-red-400">{{ statistics.missingKeys }}</div>
          </div>
        </div>
      </div>
    </UModal>
  </div>
</template>

