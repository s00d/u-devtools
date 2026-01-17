<script setup lang="ts">
import { computed } from 'vue';
import { useRepo } from '../../composables/useRepo';
import { UIcon } from '@u-devtools/ui';

const repo = useRepo();

const isAnalyzing = computed(() => repo.isAnalyzing.value);

const tokenLimit = computed(() => repo.config.value.token_limit || 128000);

const percentage = computed(() => {
  if (tokenLimit.value <= 0) return 0;
  return (repo.stats.value.tokens / tokenLimit.value) * 100;
});

const isOverLimit = computed(() => repo.stats.value.tokens > tokenLimit.value);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTokenCount(tokens: number): string {
  if (tokens < 1000) return `${tokens}`;
  return `${(tokens / 1000).toFixed(1)}k`;
}
</script>

<template>
  <div class="h-7 bg-blue-600 text-white flex items-center px-3 text-xs select-none justify-between">
    <!-- Left: Statistics -->
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5" title="Selected Files">
        <UIcon name="File" class="w-3.5 h-3.5 opacity-70" />
        <span class="font-medium">{{ repo.stats.value.files }}</span> files
      </div>

      <div class="flex items-center gap-1.5" title="Total Size">
        <UIcon name="Database" class="w-3.5 h-3.5 opacity-70" />
        <span class="font-medium">{{ formatFileSize(repo.stats.value.size) }}</span>
      </div>

      <div class="flex items-center gap-1.5" title="Estimated Tokens (File Size / 4)">
        <UIcon name="Cpu" class="w-3.5 h-3.5 opacity-70" />
        <span class="font-medium">~{{ formatTokenCount(repo.stats.value.tokens) }}</span> tokens
      </div>

      <!-- Context Usage -->
      <div class="flex flex-col w-32 ml-4">
        <div class="flex justify-between text-[10px] mb-0.5">
          <span>Context Usage</span>
          <span :class="isOverLimit ? 'text-red-300' : 'text-blue-200'">
            {{ Math.round(percentage) }}%
          </span>
        </div>
        <div class="h-1.5 bg-blue-800/30 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500"
            :class="isOverLimit ? 'bg-red-400' : 'bg-blue-300'"
            :style="{ width: `${Math.min(percentage, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Right: Status / Path -->
    <div class="flex items-center gap-3">
      <div v-if="isAnalyzing" class="flex items-center gap-2 animate-pulse text-blue-200" :key="`scanning-${isAnalyzing}`">
        <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
        <span>Scanning...</span>
      </div>
      <div class="flex items-center gap-1.5 opacity-80 max-w-[300px]">
        <UIcon name="Folder" class="w-3.5 h-3.5 shrink-0" />
        <span class="truncate">{{ repo.rootPath || 'No Folder' }}</span>
      </div>
    </div>
  </div>
</template>
