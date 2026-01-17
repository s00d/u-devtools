<script setup lang="ts">
import { computed, ref } from 'vue';
import type { FileRow } from '../../composables/useRepo';
import { useRepo } from '../../composables/useRepo';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  row: FileRow;
  focused?: boolean;
  searchQuery?: string;
}>();

const emit = defineEmits<{
  select: [id: string];
  expand: [id: string];
  'file-click': [id: string];
}>();

const repo = useRepo();
const copied = ref(false);

const indent = computed(() => props.row.depth * 20);
const isLoading = computed(() => repo.loadingNodes.value.has(props.row.id));

function handleClick() {
  if (props.row.is_directory) {
    emit('expand', props.row.id);
  } else {
    emit('file-click', props.row.id);
  }
}

function handleCheckboxClick(e: Event) {
  e.stopPropagation();
  emit('select', props.row.id);
}

function handleSetAsRoot() {
  repo.openDirectory(props.row.path);
}

async function handleReveal() {
  await repo.revealInExplorer(props.row.path);
}

async function handleCopyPath() {
  try {
    await navigator.clipboard.writeText(props.row.path);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (error) {
    console.error('[repo2txt] Failed to copy path:', error);
  }
}

const highlightedName = computed(() => {
  if (!props.searchQuery || !props.searchQuery.trim()) {
    return escapeHtml(props.row.name);
  }
  
  const query = props.searchQuery.trim().toLowerCase();
  const name = props.row.name;
  const lowerName = name.toLowerCase();
  
  const index = lowerName.indexOf(query);
  if (index === -1) {
    return escapeHtml(name);
  }
  
  const before = escapeHtml(name.substring(0, index));
  const match = escapeHtml(name.substring(index, index + query.length));
  const after = escapeHtml(name.substring(index + query.length));
  
  return `${before}<mark class="bg-yellow-600/50 text-yellow-200 font-semibold rounded-sm px-0.5">${match}</mark>${after}`;
});

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getFileIcon(filename: string): string {
  // Handle files without extension
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
  
  // Handle special files without extension
  if (!ext) {
    const nameLower = filename.toLowerCase();
    if (nameLower === 'dockerfile' || nameLower === 'makefile' || nameLower === 'readme' || nameLower === 'license' || nameLower === 'changelog') {
      return 'FileText';
    }
    return 'File';
  }
  
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'vue':
    case 'py':
    case 'rs':
    case 'go':
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return 'FileCode';
    case 'json':
    case 'yml':
    case 'yaml':
    case 'toml':
    case 'xml':
      return 'FileJson';
    case 'css':
    case 'scss':
    case 'less':
      return 'FileType';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'svg':
    case 'gif':
    case 'webp':
      return 'FileImage';
    case 'md':
    case 'txt':
      return 'FileText';
    default:
      return 'File';
  }
}

function getFileIconColor(filename: string): string {
  // Handle files without extension
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
  
  if (!ext) {
    return 'text-gray-400';
  }
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'text-blue-500';
    case 'js':
    case 'jsx':
      return 'text-yellow-500';
    case 'rs':
      return 'text-orange-500';
    case 'json':
      return 'text-yellow-500';
    case 'css':
    case 'scss':
    case 'less':
      return 'text-sky-400';
    case 'html':
      return 'text-orange-500';
    case 'vue':
      return 'text-emerald-500';
    case 'md':
      return 'text-gray-400';
    case 'toml':
      return 'text-blue-400';
    case 'yaml':
    case 'yml':
      return 'text-purple-500';
    case 'py':
      return 'text-blue-400';
    case 'go':
      return 'text-cyan-500';
    case 'java':
      return 'text-orange-500';
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return 'text-blue-500';
    default:
      return 'text-gray-400';
  }
}
</script>

<template>
  <div
    class="group flex items-center h-[26px] cursor-pointer select-none transition-all duration-150 relative pr-2"
    role="treeitem"
    :aria-label="row.is_directory ? `Folder: ${row.name}` : `File: ${row.name}`"
    :aria-selected="row.selected"
    :aria-expanded="row.is_directory ? row.expanded : undefined"
    :tabindex="focused ? 0 : -1"
    :class="[
      row.selected
        ? 'bg-blue-900/30'
        : 'hover:bg-gray-800',
      { 'ring-1 ring-inset ring-blue-500': focused },
      { 'text-blue-200': row.selected },
    ]"
    @click="handleClick"
  >
    <!-- Indent Guides (Vertical Lines) -->
    <div
      v-for="i in row.depth"
      :key="i"
      class="absolute h-full w-px bg-gray-700 z-0"
      :style="{ left: `${(i - 1) * 20 + 11}px` }"
    ></div>

    <!-- Container with indentation -->
    <div
      class="flex items-center flex-1 min-w-0 h-full relative z-10"
      :style="{ paddingLeft: `${row.depth * 20}px` }"
    >
      <!-- Toggle Arrow / Loader -->
      <div
        class="w-[22px] h-full flex items-center justify-center shrink-0 hover:text-gray-100 text-gray-400 transition-colors"
        role="button"
        :aria-label="row.is_directory ? (row.expanded ? 'Collapse folder' : 'Expand folder') : undefined"
        :aria-hidden="!row.is_directory"
        @click.stop="handleClick"
      >
        <UIcon
          v-if="isLoading"
          name="ArrowPath"
          class="w-3 h-3 animate-spin"
        />
        <UIcon
          v-else-if="row.is_directory"
          :name="row.expanded ? 'ChevronDown' : 'ChevronRight'"
          class="w-3.5 h-3.5 transition-transform duration-200 ease-in-out"
          :class="{ 'rotate-90': row.expanded }"
        />
      </div>

      <!-- Checkbox -->
      <div class="flex items-center justify-center w-[20px] h-full mr-1.5 shrink-0" @click.stop>
        <input
          type="checkbox"
          class="w-3.5 h-3.5 rounded cursor-pointer"
          :checked="row.selected"
          :aria-label="`Select ${row.is_directory ? 'folder' : 'file'}: ${row.name}`"
          @change="handleCheckboxClick"
        />
      </div>

      <!-- File/Folder Icon -->
      <div class="mr-2 shrink-0 flex items-center justify-center">
        <UIcon
          v-if="row.is_directory"
          :name="row.expanded ? 'FolderOpen' : 'Folder'"
          class="w-4 h-4 text-yellow-500"
        />
        <UIcon
          v-else
          :name="getFileIcon(row.name)"
          :class="['w-4 h-4', getFileIconColor(row.name)]"
        />
      </div>

      <!-- File Name with search highlight -->
      <span
        class="truncate text-[13px] leading-none pt-0.5 flex-1"
        :class="row.selected ? 'font-medium' : 'text-gray-300'"
        :title="row.name.length > 50 ? row.name : undefined"
        v-html="highlightedName"
      ></span>

      <!-- Action Buttons (Hover) -->
      <div class="flex items-center gap-1 pr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ml-2">
        <!-- Set Root -->
        <button
          v-if="row.is_directory"
          class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-blue-500 transition-colors"
          aria-label="Set as root directory"
          title="Set as root directory"
          @click.stop="handleSetAsRoot"
        >
          <UIcon name="ArrowDown" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <!-- Reveal -->
        <button
          class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-amber-500 transition-colors"
          aria-label="Reveal in File Explorer / Finder"
          title="Reveal in File Explorer / Finder"
          @click.stop="handleReveal"
        >
          <UIcon name="FolderOpen" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <!-- Copy Path -->
        <button
          class="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-green-500 transition-colors"
          :aria-label="copied ? 'Path copied' : 'Copy path'"
          :title="copied ? 'Copied!' : 'Copy path'"
          @click.stop="handleCopyPath"
        >
          <UIcon :name="copied ? 'Check' : 'Copy'" :class="copied ? 'text-green-500' : ''" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <!-- Size / Loader -->
      <div v-if="!row.is_directory" class="ml-auto pl-2 text-[10px] text-gray-500 shrink-0 min-w-[40px] text-right font-mono group-hover:hidden">
        <template v-if="isLoading">
          <UIcon name="ArrowPath" class="w-2.5 h-2.5 animate-spin inline" />
        </template>
        <template v-else-if="row.size !== null">
          {{ row.size < 1024 ? `${row.size}B` : row.size < 1024 * 1024 ? `${Math.round(row.size / 1024)}KB` : `${(row.size / (1024 * 1024)).toFixed(1)}MB` }}
        </template>
      </div>
    </div>
  </div>
</template>

