<script setup lang="ts">
import { UBadge, UIcon, UButton } from '@u-devtools/ui';

interface UDevToolsConfig {
  base?: string;
}

declare global {
  interface Window {
    __UDEVTOOLS_CONFIG__?: UDevToolsConfig;
  }
}

// Версия пакета
const VERSION = '0.1.0';

// Получаем base URL из конфига
const base = window.__UDEVTOOLS_CONFIG__?.base || '/__devtools';

// Функция для открытия DevTools в новой вкладке
const openInNewTab = () => {
  const url = `${window.location.origin}${base}/index.html`;
  window.open(url, '_blank');
};

const links = [
  { label: 'GitHub', url: 'https://github.com/s00d/u-devtools', icon: 'CodeBracketSquare' },
  { label: 'Documentation', url: 'https://github.com/s00d/u-devtools#readme', icon: 'BookOpen' },
  { label: 'Report Issue', url: 'https://github.com/s00d/u-devtools/issues', icon: 'BugAnt' },
];
</script>

<template>
  <div class="h-full overflow-auto bg-zinc-950 text-zinc-100 min-w-0 min-h-0">
    <div class="max-w-2xl mx-auto p-8 space-y-12">
      
      <!-- Header -->
      <div class="text-center space-y-6">
        <div class="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl mb-2">
          <UIcon name="WrenchScrewdriver" class="w-12 h-12 text-white" />
        </div>
        
        <div>
          <h1 class="text-4xl font-extrabold tracking-tight text-white mb-2">Universal DevTools</h1>
          <p class="text-lg text-zinc-400">
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
          class="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 transition-all group"
        >
          <div class="p-3 bg-black/30 rounded-full group-hover:bg-indigo-500/20 transition-colors">
            <UIcon :name="link.icon" class="w-6 h-6 text-zinc-400 group-hover:text-indigo-400" />
          </div>
          <span class="font-medium text-zinc-200">{{ link.label }}</span>
        </a>
      </div>

      <!-- Open in New Tab Button -->
      <div class="flex justify-center">
        <UButton
          variant="secondary"
          icon="ArrowTopRightOnSquare"
          @click="openInNewTab"
        >
          Open DevTools in New Tab
        </UButton>
      </div>

      <!-- Footer -->
      <div class="pt-8 border-t border-white/5 text-center">
        <p class="text-sm text-zinc-500">
          Open Source (MIT) &copy; {{ new Date().getFullYear() }} Universal DevTools Team.
        </p>
      </div>
    </div>
  </div>
</template>
