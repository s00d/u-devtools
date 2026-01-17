<script setup lang="ts">
import { computed } from 'vue';
import { UBadge, UIcon } from '@u-devtools/ui';
import type { SecurityIssue } from '../types';

const props = defineProps<{ issue: SecurityIssue }>();

const colorMap: Record<string, 'red' | 'yellow' | 'blue' | 'gray'> = {
  critical: 'red',
  high: 'yellow',
  medium: 'yellow',
  low: 'blue',
  info: 'gray',
};

// Map categories to icons
const iconMap: Record<string, string> = {
  env: 'Key',
  headers: 'GlobeAlt',
  dependencies: 'Cube',
  storage: 'CircleStack',
  scripts: 'CodeBracket',
  html: 'DocumentText',
  dom: 'GlobeAlt',
  files: 'Folder',
  'mixed-content': 'ExclamationTriangle',
  'server-response': 'Server',
};
</script>

<template>
  <div
    class="border border-gray-700 bg-gray-800 rounded-lg p-4 hover:border-gray-600 transition-colors"
  >
    <div class="flex justify-between items-start mb-2">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-gray-700 text-gray-300">
          <UIcon :name="iconMap[issue.category] || 'ExclamationTriangle'" class="w-4 h-4" />
        </div>
        <h3 class="font-bold text-gray-200">{{ issue.title }}</h3>
      </div>
      <UBadge :color="colorMap[issue.severity] || 'gray'" class="uppercase">
        {{ issue.severity }}
      </UBadge>
    </div>

    <p class="text-sm text-gray-400 mb-3">{{ issue.description }}</p>

    <div class="bg-black/30 rounded p-3 text-sm border border-gray-700/50">
      <div class="flex gap-2 items-start">
        <UIcon name="LightBulb" class="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
        <span class="text-gray-300">
          <span class="font-bold text-gray-500 text-xs uppercase mr-1">Fix:</span>
          {{ issue.recommendation }}
        </span>
      </div>
      <div
        v-if="issue.location"
        class="mt-2 pt-2 border-t border-gray-700/50 flex gap-2 items-center text-xs font-mono text-gray-500"
      >
        <UIcon name="MapPin" class="w-3 h-3" />
        {{ issue.location }}
      </div>
    </div>
  </div>
</template>

