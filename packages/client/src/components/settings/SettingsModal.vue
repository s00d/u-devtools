<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDark } from '@vueuse/core';
import { useDevToolsState } from '../../composables/useDevToolsState';
import { createSettingsApi } from '../../modules/settings';
import { UForm, UIcon } from '@u-devtools/ui';
import type { PluginSettingsSchema } from '@u-devtools/core';

const { showSettings, plugins } = useDevToolsState();
const activeSettingsTab = ref('General');

// --- ТЕМИЗАЦИЯ И ОБЩИЕ НАСТРОЙКИ ---
const generalSettingsSchema: PluginSettingsSchema = {
  theme: {
    label: 'Appearance',
    type: 'select',
    default: 'dark',
    options: [
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' },
    ]
  }
};

// Инициализируем дефолты для General
const generalApi = createSettingsApi('general');
if (!generalApi.get('theme')) {
  generalApi.set('theme', 'dark');
}

// VueUse хук для управления классом .dark на html
const isDark = useDark({
  storageKey: null, // Отключаем встроенное сохранение useDark, управляем через наш стор
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

// Синхронизация: Настройка -> UI
const currentTheme = computed(() => generalApi.get('theme', 'dark'));
watch(currentTheme, (val) => {
  isDark.value = val === 'dark';
}, { immediate: true });
// -------------------------------------

watch(showSettings, (val) => {
  if (val) activeSettingsTab.value = 'General';
});
</script>

<template>
  <div 
    v-if="showSettings" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
    @click.self="showSettings = false"
  >
    <div class="bg-white dark:bg-[#111827] rounded-xl shadow-2xl w-full max-w-[800px] max-h-[calc(100vh-2rem)] flex overflow-hidden border border-gray-200 dark:border-gray-700">
      
      <!-- Sidebar -->
      <div class="w-64 bg-gray-50 dark:bg-[#1f2937] border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0">
        <div class="p-4 font-bold text-lg dark:text-white border-b border-gray-200 dark:border-gray-700">Settings</div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button 
            @click="activeSettingsTab = 'General'" 
            class="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors" 
            :class="activeSettingsTab === 'General' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <UIcon name="Cog6Tooth" class="w-4 h-4" /> 
            General
          </button>
          <button 
            v-for="plugin in plugins.filter(p => p.settings)" 
            :key="plugin.name" 
            @click="activeSettingsTab = plugin.name" 
            class="w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors" 
            :class="activeSettingsTab === plugin.name ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
          >
            <UIcon :name="plugin.icon" class="w-4 h-4" /> 
            {{ plugin.name }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#111827]">
          <h2 class="font-bold text-gray-900 dark:text-white">{{ activeSettingsTab }}</h2>
          <button @click="showSettings = false" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <UIcon name="XMark" class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="activeSettingsTab === 'General'">
            <UForm 
              :schema="generalSettingsSchema" 
              :model-value="generalApi.all" 
              @update:model-value="(vals) => Object.entries(vals).forEach(([k,v]) => generalApi.set(k, v))" 
            />
          </div>
          <template v-for="plugin in plugins" :key="plugin.name">
            <div v-if="activeSettingsTab === plugin.name && plugin.settings">
              <UForm 
                :schema="plugin.settings" 
                :model-value="createSettingsApi(plugin.name).all" 
                @update:model-value="(v) => { const api = createSettingsApi(plugin.name); Object.entries(v).forEach(([k,val]) => api.set(k, val)); }" 
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

