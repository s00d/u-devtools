<script setup lang="ts">
import { UBadge, UIcon } from '@u-devtools/ui';

// Версия пакета
const VERSION = '0.1.0';

const links = [
  { label: 'GitHub', url: 'https://github.com/your-repo/u-devtools', icon: 'CodeBracket' },
  { label: 'Documentation', url: '#', icon: 'BookOpen' },
  { label: 'Report Issue', url: '#', icon: 'BugAnt' },
];
</script>

<template>
  <div class="h-full overflow-auto bg-[#111827] text-gray-200 min-w-0 min-h-0">
    <div class="max-w-2xl mx-auto p-8 space-y-12">
      
      <!-- Header -->
      <div class="text-center space-y-6">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-2">
          <UIcon name="WrenchScrewdriver" class="w-12 h-12 text-white" />
        </div>
        
        <div>
          <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">Universal DevTools</h1>
          <p class="text-lg text-gray-400">
            The framework-agnostic debugging suite for Vite applications.
          </p>
        </div>

        <div class="flex justify-center gap-3">
          <UBadge color="blue" size="md">v{{ VERSION }}</UBadge>
          <UBadge color="green" size="md">Stable</UBadge>
        </div>
      </div>

      <!-- Links Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a 
          v-for="link in links" 
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50 transition-all group"
        >
          <div class="p-3 bg-gray-800 rounded-full group-hover:bg-indigo-900/30 transition-colors">
            <UIcon :name="link.icon" class="w-6 h-6 text-gray-400 group-hover:text-indigo-400" />
          </div>
          <span class="font-medium text-gray-200">{{ link.label }}</span>
        </a>
      </div>

      <!-- Footer -->
      <div class="pt-8 border-t border-gray-800 text-center">
        <p class="text-sm text-gray-500">
          Open Source (MIT) &copy; {{ new Date().getFullYear() }} Universal DevTools Team.
        </p>
      </div>
    </div>
  </div>
</template>
