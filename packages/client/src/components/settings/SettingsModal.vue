<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useDark } from '@vueuse/core';
import { useDevToolsState } from '../../composables/useDevToolsState';
import { createSettingsApi } from '../../modules/settings';
import { createApiForPlugin } from '../../modules/clientApi';
import { UForm, UIcon, UButton } from '@u-devtools/ui';
import type { PluginSettingsSchema } from '@u-devtools/core';
import PluginRenderer from '../PluginRenderer.vue';

const { showSettings, plugins } = useDevToolsState();
const activeSettingsTab = ref('General');

// --- ОБЩИЕ НАСТРОЙКИ ---
const generalSettingsSchema: PluginSettingsSchema = {
  scale: {
    label: 'UI Scale',
    type: 'select',
    default: '1',
    options: [
      { label: 'Tiny (85%)', value: '0.85' },
      { label: 'Compact (90%)', value: '0.9' },
      { label: 'Normal (100%)', value: '1' },
      { label: 'Large (110%)', value: '1.1' },
      { label: 'Huge (125%)', value: '1.25' }
    ]
  },
  opacity: {
    label: 'Panel Opacity',
    type: 'select',
    default: '1',
    options: [
      { label: 'Solid (100%)', value: '1' },
      { label: 'Slightly Transparent (95%)', value: '0.95' },
      { label: 'Glass (90%)', value: '0.9' },
      { label: 'Ghost (80%)', value: '0.8' }
    ]
  },
  notifications: {
    label: 'Enable Notifications',
    type: 'boolean',
    default: true
  },
  reducedMotion: {
    label: 'Reduced Motion',
    type: 'boolean',
    default: false
  },
  launchEditor: {
    label: 'Editor for "Open in IDE"',
    description: 'Select your preferred code editor',
    type: 'select',
    default: 'code',
    options: [
      { label: 'Visual Studio Code', value: 'code' },
      { label: 'VS Code Insiders', value: 'code-insiders' },
      { label: 'VSCodium', value: 'codium' },
      { label: 'Cursor', value: 'cursor' },
      { label: 'WebStorm', value: 'webstorm' },
      { label: 'IntelliJ IDEA', value: 'idea' },
      { label: 'PyCharm', value: 'pycharm' },
      { label: 'PhpStorm', value: 'phpstorm' },
      { label: 'CLion', value: 'clion' },
      { label: 'Rider', value: 'rider' },
      { label: 'RubyMine', value: 'rubymine' },
      { label: 'AppCode', value: 'appcode' },
      { label: 'Sublime Text', value: 'sublime' },
      { label: 'Zed', value: 'zed' },
      { label: 'Atom', value: 'atom' },
      { label: 'Atom Beta', value: 'atom-beta' },
      { label: 'Brackets', value: 'brackets' },
      { label: 'Vim', value: 'vim' },
      { label: 'Emacs', value: 'emacs' },
      { label: 'Visual Studio', value: 'visualstudio' },
      { label: 'Notepad++', value: 'notepad++' }
    ]
  }
};

// Инициализируем дефолты для General
const generalApi = createSettingsApi('general');
const defaults = {
  scale: '1',
  opacity: '1',
  notifications: true,
  reducedMotion: false,
  launchEditor: 'code'
};

Object.entries(defaults).forEach(([k, v]) => {
  if (generalApi.get(k) === undefined) {
    generalApi.set(k, v);
  }
});

// VueUse хук для управления классом .dark на html (всегда темная тема)
const isDark = useDark({
  selector: 'html',
  storageKey: null,
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

// Всегда устанавливаем темную тему
onMounted(() => {
  isDark.value = true;
});

// --- ПРИМЕНЕНИЕ НАСТРОЕК ---

// 1. Масштаб и Прозрачность (через CSS переменные)
const currentScale = computed(() => generalApi.get('scale', '1'));
const currentOpacity = computed(() => generalApi.get('opacity', '1'));

watch([currentScale, currentOpacity], ([scale, opacity]) => {
  document.documentElement.style.setProperty('--udt-scale', String(scale));
  document.documentElement.style.setProperty('--udt-opacity', String(opacity));
}, { immediate: true });

// 2. Reduced Motion
const reducedMotion = computed(() => generalApi.get('reducedMotion', false));
watch(reducedMotion, (val) => {
  if (val) {
    document.documentElement.classList.add('udt-reduce-motion');
  } else {
    document.documentElement.classList.remove('udt-reduce-motion');
  }
}, { immediate: true });

// 3. Notifications (проверяется в useNotifications)

// --- СБРОС НАСТРОЕК ---
const resetAllSettings = () => {
  if (!confirm('Are you sure you want to reset all DevTools settings? This will reload the page.')) {
    return;
  }
  
  // Удаляем все настройки из localStorage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('u-devtools-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Перезагружаем страницу
  window.location.reload();
};

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
    <div class="bg-[#18181b]/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-[800px] max-h-[calc(100vh-2rem)] flex overflow-hidden border border-white/10">
      
      <!-- Sidebar -->
      <div class="w-64 bg-[#18181b] border-r border-white/5 flex flex-col shrink-0">
        <div class="p-4 font-bold text-lg text-white border-b border-white/5">Settings</div>
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <button 
            @click="activeSettingsTab = 'General'" 
            class="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200" 
            :class="activeSettingsTab === 'General' ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'"
          >
            <UIcon name="Cog6Tooth" class="w-4 h-4" /> 
            General
          </button>
          <button 
            v-for="plugin in plugins.filter(p => p.settings)" 
            :key="plugin.name" 
            @click="activeSettingsTab = plugin.name" 
            class="w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200" 
            :class="activeSettingsTab === plugin.name ? 'bg-white/10 text-white font-medium shadow-sm' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'"
          >
            <UIcon :name="plugin.icon" class="w-4 h-4" /> 
            {{ plugin.name }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-[#18181b]/50 backdrop-blur-sm">
          <h2 class="font-bold text-white">{{ activeSettingsTab }}</h2>
          <button @click="showSettings = false" class="text-zinc-400 hover:text-zinc-200 transition-colors">
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
            
            <!-- Danger Zone: Factory Reset -->
            <div class="mt-8 pt-6 border-t border-white/5">
              <h3 class="text-sm font-bold text-red-400 mb-2">Danger Zone</h3>
              <div class="flex items-center justify-between">
                <p class="text-xs text-zinc-400">Reset all settings (general and plugins) to default.</p>
                <UButton variant="danger" size="sm" @click="resetAllSettings">
                  Factory Reset
                </UButton>
              </div>
            </div>
          </div>
          <template v-for="plugin in plugins" :key="plugin.name">
            <div v-if="activeSettingsTab === plugin.name && plugin.settings" class="h-full">
              <!-- Custom renderSettings if provided by plugin -->
              <PluginRenderer
                v-if="plugin.renderSettings"
                :api="createApiForPlugin(plugin.name)"
                :renderer="plugin.renderSettings"
              />
              <!-- Standard UForm for plugins without custom renderSettings -->
              <UForm
                v-else
                :schema="plugin.settings" 
                :model-value="createSettingsApi(plugin.name).all" 
                @update:model-value="(v: Record<string, unknown>) => { const api = createSettingsApi(plugin.name); Object.entries(v).forEach(([k,val]) => api.set(k, val)); }" 
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

