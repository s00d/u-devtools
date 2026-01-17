<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useDark, useClipboard } from '@vueuse/core';
import { useDevToolsState } from '../../composables/useDevToolsState';
import { createSettingsApi } from '../../modules/settings';
import { createApiForPlugin, RPC_URL_KEY, systemApi } from '../../modules/clientApi';
import { UForm, UIcon, UButton, UInput, UBadge } from '@u-devtools/ui';
import type { PluginSettingsSchema } from '@u-devtools/core';
import PluginRenderer from '../PluginRenderer.vue';

const { showSettings, plugins } = useDevToolsState();
const activeSettingsTab = ref('General');
const { copy } = useClipboard();

// --- Connection Settings State ---
const customRpcUrl = ref('');
const copiedRpcUrl = ref(false);

// Compute default values
const defaultRpcUrl = computed(() => {
  const win = window as any;
  // 1. Check global config (Electron/Tauri preload)
  if (win.__UDEVTOOLS_CONFIG__?.wsUrl) {
    return win.__UDEVTOOLS_CONFIG__.wsUrl;
  }
  // 2. Auto-detection (standard Vite plugin path)
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  return `${protocol}//${host}/__u-devtools-ws`;
});

// Update data when opening or changing settings
onMounted(() => {
  // Priority: global config (Electron persisted), then localStorage
  const globalConfig = (window as any).__UDEVTOOLS_CONFIG__;
  customRpcUrl.value = globalConfig?.customRpcUrl || localStorage.getItem(RPC_URL_KEY) || '';
});

const saveConnection = async () => {
  const newValue = customRpcUrl.value.trim();
  
  // 1. Save to LocalStorage (client cache)
  if (newValue) {
    localStorage.setItem(RPC_URL_KEY, newValue);
  } else {
    localStorage.removeItem(RPC_URL_KEY);
  }

  // 2. SEND TO SERVER VIA RPC (Universal method)
  try {
    // Send request to save config
    // Server (Electron or Vite) will decide where to write it (file or memory)
    await systemApi.rpc.call('sys:saveConfig', { customRpcUrl: newValue });
    console.log('[Settings] Config saved to server');
  } catch (e) {
    console.warn('[Settings] Failed to save config to server (RPC method might not be implemented):', e);
  }
  
  // Reload to apply settings
  window.location.reload();
};

const copyRpcUrl = async () => {
  const urlToCopy = customRpcUrl.value || defaultRpcUrl.value;
  await copy(urlToCopy);
  copiedRpcUrl.value = true;
  setTimeout(() => {
    copiedRpcUrl.value = false;
  }, 2000);
};

// --- GENERAL SETTINGS ---
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
      { label: 'Huge (125%)', value: '1.25' },
    ],
  },
  opacity: {
    label: 'Panel Opacity',
    type: 'select',
    default: '1',
    options: [
      { label: 'Solid (100%)', value: '1' },
      { label: 'Slightly Transparent (95%)', value: '0.95' },
      { label: 'Glass (90%)', value: '0.9' },
      { label: 'Ghost (80%)', value: '0.8' },
    ],
  },
  notifications: {
    label: 'Enable Notifications',
    type: 'boolean',
    default: true,
  },
  reducedMotion: {
    label: 'Reduced Motion',
    type: 'boolean',
    default: false,
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
      { label: 'Notepad++', value: 'notepad++' },
    ],
  },
};

// Initialize defaults for General
const generalApi = createSettingsApi('general');
const defaults = {
  scale: '1',
  opacity: '1',
  notifications: true,
  reducedMotion: false,
  launchEditor: 'code',
};

Object.entries(defaults).forEach(([k, v]) => {
  if (generalApi.get(k) === undefined) {
    generalApi.set(k, v);
  }
});

// VueUse hook for managing .dark class on html (always dark theme)
const isDark = useDark({
  selector: 'html',
  storageKey: null,
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
});

// Always set dark theme
onMounted(() => {
  isDark.value = true;
});

// --- APPLY SETTINGS ---

// 1. Scale and Opacity (via CSS variables)
const currentScale = computed(() => generalApi.get('scale', '1'));
const currentOpacity = computed(() => generalApi.get('opacity', '1'));

watch(
  [currentScale, currentOpacity],
  ([scale, opacity]) => {
    document.documentElement.style.setProperty('--udt-scale', String(scale));
    document.documentElement.style.setProperty('--udt-opacity', String(opacity));
  },
  { immediate: true }
);

// 2. Reduced Motion
const reducedMotion = computed(() => generalApi.get('reducedMotion', false));
watch(
  reducedMotion,
  (val) => {
    if (val) {
      document.documentElement.classList.add('udt-reduce-motion');
    } else {
      document.documentElement.classList.remove('udt-reduce-motion');
    }
  },
  { immediate: true }
);

// 3. Notifications (checked in useNotifications)

// --- RESET SETTINGS ---
const resetAllSettings = () => {
  if (
    !confirm('Are you sure you want to reset all DevTools settings? This will reload the page.')
  ) {
    return;
  }

  // Remove all settings from localStorage
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith('u-devtools-')) {
      localStorage.removeItem(key);
    }
  });

  // Reload page
  window.location.reload();
};

watch(showSettings, (val) => {
  if (val) {
    activeSettingsTab.value = 'General';
    // Priority: global config (Electron persisted), then localStorage
    const globalConfig = (window as any).__UDEVTOOLS_CONFIG__;
    customRpcUrl.value = globalConfig?.customRpcUrl || localStorage.getItem(RPC_URL_KEY) || '';
  }
});
</script>

<template>
  <div 
    v-if="showSettings" 
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
    @click.self="showSettings = false"
  >
    <div class="bg-zinc-900/95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-[800px] max-h-[calc(100vh-2rem)] flex overflow-hidden border border-white/10">
      
      <!-- Sidebar -->
      <div class="w-64 bg-zinc-900 border-r border-white/5 flex flex-col shrink-0">
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
      <div class="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <div class="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50 backdrop-blur-sm">
          <h2 class="font-bold text-white">{{ activeSettingsTab }}</h2>
          <button @click="showSettings = false" class="text-zinc-400 hover:text-zinc-200 transition-colors">
            <UIcon name="XMark" class="w-6 h-6" />
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="activeSettingsTab === 'General'" class="space-y-8">
            
            <!-- Connection Settings -->
            <div>
              <h3 class="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider">Remote Connection</h3>
              <div class="bg-black/20 border border-white/5 rounded-lg p-4 space-y-4">
                
                <!-- RPC WebSocket URL -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-sm text-gray-200 font-medium">RPC WebSocket URL</label>
                    <UButton 
                      variant="ghost" 
                      size="xs" 
                      :icon="copiedRpcUrl ? 'Check' : 'Clipboard'"
                      :class="{ 'text-green-400': copiedRpcUrl }"
                      @click="copyRpcUrl"
                    />
                  </div>
                  
                  <div class="flex gap-2 items-center bg-black/40 p-2 rounded border border-white/5 mb-1">
                    <code class="flex-1 text-xs text-zinc-400 font-mono break-all">
                      Default: {{ defaultRpcUrl }}
                    </code>
                  </div>
                  
                  <UInput 
                    v-model="customRpcUrl" 
                    :placeholder="`Override (default: ${defaultRpcUrl})`" 
                    class="w-full"
                  />
                  <p class="text-xs text-zinc-500">
                    WebSocket URL for RPC communication. Used for all RPC calls (sys:getPlugins, etc.).
                    Leave empty to use default.
                  </p>
                </div>

                <UButton 
                  variant="primary" 
                  icon="ArrowPath" 
                  @click="saveConnection"
                  class="w-full mt-4"
                >
                  Apply & Reload
                </UButton>
              </div>
            </div>

            <!-- Interface Settings -->
            <div>
              <h3 class="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider">Interface</h3>
              <UForm 
                :schema="generalSettingsSchema" 
                :model-value="generalApi.all" 
                @update:model-value="(vals) => Object.entries(vals).forEach(([k,v]) => generalApi.set(k, v))" 
              />
            </div>
            
            <!-- Danger Zone: Factory Reset -->
            <div class="pt-6 border-t border-white/5">
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
                :plugin-name="plugin.name"
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

