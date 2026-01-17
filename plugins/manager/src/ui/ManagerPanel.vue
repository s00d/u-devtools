<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { UButton, UIcon, UInput, UTabs, UEmpty, UPluginLayout } from '@u-devtools/ui';
import { useApi } from '../context';
import MarkdownIt from 'markdown-it';
import InstalledPluginCard from './InstalledPluginCard.vue';
import MarketplacePluginCard from './MarketplacePluginCard.vue';
import ReadmeModal from './ReadmeModal.vue';
import CreatePluginTab from './CreatePluginTab.vue';

const api = useApi();

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface PluginData {
  name: string;
  isCore: boolean;
  meta: {
    name?: string;
    version: string;
    description?: string;
    homepage?: string;
    author?: string;
    repository?: string;
  };
  latestVersion?: string;
}

interface MarketPlugin {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
  repository?: string;
  downloads?: number;
  stars?: number;
  keywords?: string[];
  isOfficial?: boolean;
}

interface NpmInfo {
  name: string;
  version: string;
  description: string;
  readme: string;
  downloads: number;
  stars: number;
  keywords: string[];
  homepage: string;
  repository: string;
}

const activeTab = ref<'Installed' | 'Marketplace' | 'Create'>('Installed');
const selectedPlugin = ref<MarketPlugin | null>(null);
const npmInfo = ref<NpmInfo | null>(null);
const showReadmeModal = ref(false);
const readmeLoading = ref(false);
const readmeHtml = ref('');
const installedPlugins = ref<PluginData[]>([]);
const marketPlugins = ref<MarketPlugin[]>([]);
const loading = ref(false);
const processing = ref<string | null>(null);
const searchQuery = ref('');

// Load installed
const loadInstalled = async () => {
  loading.value = true;
  try {
    // Use sys:getPlugins to get plugin list (core system call)
    const pluginsList = await api.rpc.call<Array<{ name: string }>>('sys:getPlugins');

    // Then get detailed info via sys:plugins:list (remains in core)
    const list = await api.rpc.call<PluginData[]>('sys:plugins:list');
    installedPlugins.value = list;

    // Check updates for non-core plugins
    const npmPackages = list
      .filter((p) => !p.isCore && p.meta.name && p.meta.name !== 'unknown')
      .map((p) => p.meta.name as string);

    if (npmPackages.length > 0) {
      const updates = await api.rpc.call<Record<string, string>>(
        'manager:checkUpdates',
        npmPackages
      );
      installedPlugins.value = installedPlugins.value.map((p) => {
        if (p.meta.name && updates[p.meta.name]) {
          return { ...p, latestVersion: updates[p.meta.name] };
        }
        return p;
      });
    }
  } catch (e) {
    api.notify('Failed to load plugins', 'error');
  } finally {
    loading.value = false;
  }
};

// Search in NPM
const searchMarket = async () => {
  loading.value = true;
  try {
    const query = searchQuery.value || 'keywords:u-devtools-plugin';
    const results = await api.rpc.call<MarketPlugin[]>('manager:search', query);

    // Enrich results with data from NPM
    marketPlugins.value = await Promise.all(
      results.map(async (plugin) => {
        try {
          const info = await api.rpc.call<NpmInfo | null>('manager:getNpmInfo', plugin.name);
          if (info) {
            return {
              ...plugin,
              downloads: info.downloads,
              stars: info.stars,
              keywords: info.keywords,
              repository: info.repository,
              isOfficial: plugin.name.startsWith('@u-devtools/'),
            };
          }
          return {
            ...plugin,
            isOfficial: plugin.name.startsWith('@u-devtools/'),
          };
        } catch (e) {
          return {
            ...plugin,
            isOfficial: plugin.name.startsWith('@u-devtools/'),
          };
        }
      })
    );
  } catch (e) {
    api.notify('Failed to search plugins', 'error');
    marketPlugins.value = [];
  } finally {
    loading.value = false;
  }
};

// View README
const viewReadme = async (plugin: MarketPlugin) => {
  selectedPlugin.value = plugin;
  showReadmeModal.value = true;
  readmeLoading.value = true;
  readmeHtml.value = '';

  try {
    const info = await api.rpc.call<NpmInfo | null>('manager:getNpmInfo', plugin.name);
    if (info?.readme) {
      readmeHtml.value = md.render(info.readme);
      npmInfo.value = info;
    } else {
      readmeHtml.value = '<p class="text-gray-400">No README available for this plugin.</p>';
    }
  } catch (e) {
    readmeHtml.value = '<p class="text-red-400">Failed to load README.</p>';
  } finally {
    readmeLoading.value = false;
  }
};

const install = async (pkg: MarketPlugin) => {
  const confirmed = await api.dialog.confirm({
    title: 'Install Plugin',
    message: `Install ${pkg.name}? The server will restart automatically.`,
    confirmText: 'Install',
    cancelText: 'Cancel',
  });

  if (!confirmed) return;

  processing.value = pkg.name;
  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>(
      'manager:install',
      pkg.name
    );
    if (res.success) {
      api.notify('Plugin installed! Server restarting...', 'success');
      // Reload installed list
      setTimeout(() => {
        loadInstalled();
        // Switch to Installed tab
        activeTab.value = 'Installed';
      }, 1000);
    } else {
      api.notify(`Installation failed: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    api.notify(`Installation failed: ${message}`, 'error');
  } finally {
    processing.value = null;
  }
};

const uninstall = async (pkgName: string) => {
  const confirmed = await api.dialog.confirm({
    title: 'Uninstall Plugin',
    message: `Uninstall ${pkgName}? You may need to remove it from vite.config.ts manually.`,
    confirmText: 'Uninstall',
    cancelText: 'Cancel',
  });

  if (!confirmed) return;

  processing.value = pkgName;
  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>(
      'manager:uninstall',
      pkgName
    );
    if (res.success) {
      api.notify('Plugin uninstalled', 'success');
      loadInstalled();
    } else {
      api.notify(`Uninstall failed: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    api.notify(`Uninstall failed: ${message}`, 'error');
  } finally {
    processing.value = null;
  }
};

const hasUpdate = (current: string, latest?: string) => {
  return latest && current !== latest;
};

const isInstalled = (pkgName: string) => {
  return installedPlugins.value.some((p) => p.meta.name === pkgName);
};

const handleRefresh = () => {
  loadInstalled();
};

onMounted(() => {
  loadInstalled();
});
</script>

<template>
  <UPluginLayout title="Plugin Manager" icon="Squares2X2">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        <UTabs
          :items="['Installed', 'Marketplace', 'Create']"
          :model-value="activeTab"
          @update:model-value="
            (v) => {
              activeTab = v as typeof activeTab;
              if (v === 'Marketplace') searchMarket();
              else if (v === 'Installed') loadInstalled();
            }
          "
        />
      </div>
    </template>
    <template #actions>
      <div v-if="activeTab === 'Marketplace'" class="w-64">
        <UInput
          v-model="searchQuery"
          placeholder="Search npm..."
          size="sm"
          @keydown.enter="searchMarket"
        >
          <template #suffix>
            <button @click="searchMarket" class="p-1 hover:bg-white/5 rounded-lg transition-colors">
              <UIcon name="MagnifyingGlass" class="w-4 h-4" />
            </button>
          </template>
        </UInput>
      </div>
      <UButton
        v-if="activeTab === 'Installed'"
        variant="ghost"
        size="sm"
        icon="ArrowPath"
        :loading="loading"
        @click="loadInstalled"
      >
        Refresh
      </UButton>
    </template>

    <!-- Content -->
    <div class="h-full overflow-auto p-6 relative min-w-0 min-h-0">
      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-10"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2"></div>
          <p class="text-sm text-zinc-400">Loading...</p>
        </div>
      </div>

      <!-- LIST: Installed -->
      <div v-if="activeTab === 'Installed'" class="space-y-4">
        <InstalledPluginCard
          v-for="plugin in installedPlugins"
          :key="plugin.name"
          :plugin="plugin"
          :processing="processing"
          @uninstall="uninstall"
        />

        <UEmpty
          v-if="!loading && installedPlugins.length === 0"
          title="No plugins installed"
          icon="Cube"
        />
      </div>

      <!-- LIST: Marketplace -->
      <div v-if="activeTab === 'Marketplace'" class="space-y-4">
        <MarketplacePluginCard
          v-for="p in marketPlugins"
          :key="p.name"
          :plugin="p"
          :is-installed="isInstalled(p.name)"
          :processing="processing"
          @install="install"
          @view-readme="viewReadme"
        />

        <UEmpty
          v-if="!loading && marketPlugins.length === 0 && searchQuery"
          title="No plugins found"
          icon="MagnifyingGlass"
        />
        <UEmpty
          v-else-if="!loading && marketPlugins.length === 0"
          title="Search for plugins"
          description="Enter a search query to find plugins on npm"
          icon="MagnifyingGlass"
        />
      </div>

      <!-- CREATE TAB -->
      <CreatePluginTab v-if="activeTab === 'Create'" @refresh="handleRefresh" />
    </div>

    <!-- README Modal -->
    <ReadmeModal
      :visible="showReadmeModal"
      :loading="readmeLoading"
      :readme-html="readmeHtml"
      @close="showReadmeModal = false"
    />
  </UPluginLayout>
</template>

