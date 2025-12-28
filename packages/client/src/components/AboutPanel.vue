<script setup lang="ts">
import { UBadge, UIcon } from '@u-devtools/ui';
import type { PluginClientInstance } from '@u-devtools/core';

defineProps<{
  plugins: PluginClientInstance[];
}>();

// Версия пакета
const VERSION = '0.1.0';

const links = [
  { label: 'GitHub', url: 'https://github.com/your-repo/u-devtools', icon: 'CodeBracket' },
  { label: 'Documentation', url: '#', icon: 'BookOpen' },
  { label: 'Report Issue', url: '#', icon: 'BugAnt' },
];
</script>

<template>
  <div class="h-full overflow-auto bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200">
    <div class="max-w-3xl mx-auto p-8 space-y-8">
      
      <!-- Header -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-4">
          <UIcon name="Wrench" class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-3xl font-bold tracking-tight dark:text-white">Universal DevTools</h1>
        <p class="text-gray-500 dark:text-gray-400 text-lg">
          The framework-agnostic debugging suite for Vite.
        </p>
        <div class="flex justify-center gap-2">
          <UBadge color="blue">v{{ VERSION }}</UBadge>
          <UBadge color="green">Stable</UBadge>
        </div>
      </div>

      <!-- Links -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a 
          v-for="link in links" 
          :key="link.label"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
        >
          <UIcon :name="link.icon" class="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition" />
          <span class="font-medium dark:text-gray-200">{{ link.label }}</span>
        </a>
      </div>

      <!-- Active Plugins -->
      <div class="space-y-4">
        <h2 class="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700 dark:text-gray-200">Installed Plugins</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="plugin in plugins" 
            :key="plugin.name"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50"
          >
            <div class="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
              <UIcon :name="plugin.icon" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <div class="font-bold text-sm dark:text-gray-200">{{ plugin.name }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">Active</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tech Stack -->
      <div class="space-y-4 pt-4">
        <h2 class="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700 dark:text-gray-200">Powered By</h2>
        <div class="flex flex-wrap gap-2">
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-300">Vite</span>
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-300">Vue 3</span>
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-300">TypeScript</span>
          <span class="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-gray-600 dark:text-gray-300">Tailwind CSS</span>
        </div>
      </div>

      <div class="text-center text-xs text-gray-400 dark:text-gray-500 pt-8">
        &copy; {{ new Date().getFullYear() }} Universal DevTools Team. Open Source (MIT).
      </div>
    </div>
  </div>
</template>

