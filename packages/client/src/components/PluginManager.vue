<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { UButton, UBadge, UIcon, UInput, UTabs, UEmpty } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{ api: ClientApi }>();

interface PluginData {
  name: string;
  isCore: boolean;
  meta: {
    name?: string;
    version: string;
    description?: string;
    homepage?: string;
    author?: string;
  };
  latestVersion?: string;
}

interface MarketPlugin {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
}

const activeTab = ref<'Installed' | 'Marketplace'>('Installed');
const installedPlugins = ref<PluginData[]>([]);
const marketPlugins = ref<MarketPlugin[]>([]);
const loading = ref(false);
const processing = ref<string | null>(null);
const searchQuery = ref('');

// Загрузка установленных
const loadInstalled = async () => {
  loading.value = true;
  try {
    const list = await props.api.rpc.call<PluginData[]>('sys:plugins:list');
    installedPlugins.value = list;

    // Проверка обновлений для не-core плагинов
    const npmPackages = list
      .filter((p) => !p.isCore && p.meta.name && p.meta.name !== 'unknown')
      .map((p) => p.meta.name!);

    if (npmPackages.length > 0) {
      const updates = await props.api.rpc.call<Record<string, string>>(
        'sys:plugins:checkUpdates',
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
    props.api.notify('Failed to load plugins', 'error');
  } finally {
    loading.value = false;
  }
};

// Поиск в NPM
const searchMarket = async () => {
  loading.value = true;
  try {
    const query = searchQuery.value || 'keywords:u-devtools-plugin';
    const results = await props.api.rpc.call<MarketPlugin[]>('sys:plugins:search', query);
    marketPlugins.value = results;
  } catch (e) {
    props.api.notify('Failed to search plugins', 'error');
    marketPlugins.value = [];
  } finally {
    loading.value = false;
  }
};

const install = async (pkg: MarketPlugin) => {
  const confirmed = await props.api.dialog.confirm({
    title: 'Install Plugin',
    message: `Install ${pkg.name}? The server will restart automatically.`,
    confirmText: 'Install',
    cancelText: 'Cancel',
  });

  if (!confirmed) return;

  processing.value = pkg.name;
  try {
    const res = await props.api.rpc.call<{ success: boolean; error?: string }>(
      'sys:plugins:install',
      pkg.name
    );
    if (res.success) {
      props.api.notify('Plugin installed! Server restarting...', 'success');
      // Перезагружаем список установленных
      setTimeout(() => {
        loadInstalled();
        // Переключаемся на вкладку Installed
        activeTab.value = 'Installed';
      }, 1000);
    } else {
      props.api.notify(`Installation failed: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: any) {
    props.api.notify(`Installation failed: ${e.message || 'Unknown error'}`, 'error');
  } finally {
    processing.value = null;
  }
};

const uninstall = async (pkgName: string) => {
  const confirmed = await props.api.dialog.confirm({
    title: 'Uninstall Plugin',
    message: `Uninstall ${pkgName}? You may need to remove it from vite.config.ts manually.`,
    confirmText: 'Uninstall',
    cancelText: 'Cancel',
  });

  if (!confirmed) return;

  processing.value = pkgName;
  try {
    const res = await props.api.rpc.call<{ success: boolean; error?: string }>(
      'sys:plugins:uninstall',
      pkgName
    );
    if (res.success) {
      props.api.notify('Plugin uninstalled', 'success');
      loadInstalled();
    } else {
      props.api.notify(`Uninstall failed: ${res.error || 'Unknown error'}`, 'error');
    }
  } catch (e: any) {
    props.api.notify(`Uninstall failed: ${e.message || 'Unknown error'}`, 'error');
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

onMounted(() => {
  loadInstalled();
});
</script>

<template>
  <div class="h-full flex flex-col bg-[#111827]">
    <!-- Header -->
    <div
      class="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50"
    >
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <UIcon name="Squares2X2" class="w-6 h-6 text-indigo-500" />
          Plugin Manager
        </h2>
        <UTabs
          :items="['Installed', 'Marketplace']"
          :model-value="activeTab"
          @update:model-value="
            (v) => {
              activeTab = v as typeof activeTab;
              if (v === 'Marketplace') searchMarket();
              else loadInstalled();
            }
          "
        />
      </div>
      <div class="flex gap-3">
        <div v-if="activeTab === 'Marketplace'" class="w-64">
          <UInput
            v-model="searchQuery"
            placeholder="Search npm..."
            @keydown.enter="searchMarket"
          >
            <template #suffix>
              <button @click="searchMarket" class="p-1 hover:bg-gray-700 rounded">
                <UIcon name="MagnifyingGlass" class="w-4 h-4" />
              </button>
            </template>
          </UInput>
        </div>
        <UButton
          v-if="activeTab === 'Installed'"
          variant="secondary"
          icon="ArrowPath"
          :loading="loading"
          @click="loadInstalled"
        >
          Refresh
        </UButton>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-6 relative">
      <!-- Loading overlay -->
      <div
        v-if="loading"
        class="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-2"></div>
          <p class="text-sm text-gray-400">Loading...</p>
        </div>
      </div>

      <!-- LIST: Installed -->
      <div v-if="activeTab === 'Installed'" class="space-y-4">
        <div
          v-for="plugin in installedPlugins"
          :key="plugin.name"
          class="border border-gray-700 rounded-xl p-5 bg-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <div
                class="p-2 rounded-lg bg-indigo-900/30 text-indigo-400"
              >
                <UIcon name="Cube" class="w-6 h-6" />
              </div>
              <div>
                <h3 class="font-bold text-white text-lg">{{ plugin.name }}</h3>
                <div class="flex items-center gap-2 mt-1">
                  <UBadge v-if="plugin.isCore" color="blue" size="xs">CORE</UBadge>
                  <UBadge v-else color="gray" size="xs">USER</UBadge>
                  <span class="text-xs text-gray-400 font-mono">v{{ plugin.meta.version }}</span>
                </div>
              </div>
            </div>

            <div v-if="hasUpdate(plugin.meta.version, plugin.latestVersion)" class="flex flex-col items-end">
              <span class="text-xs text-green-400 font-bold mb-1"
                >New version available</span
              >
              <UBadge color="green" size="xs">v{{ plugin.latestVersion }}</UBadge>
            </div>
          </div>

          <p class="text-gray-400 text-sm mb-4 flex-1">
            {{ plugin.meta.description || 'No description provided.' }}
          </p>

          <div
            class="flex items-center justify-between pt-4 border-t border-gray-700 mt-auto"
          >
            <div class="flex gap-4 text-xs text-gray-400">
              <span v-if="plugin.meta.author" class="flex items-center gap-1">
                <UIcon name="User" class="w-3 h-3" />
                {{ plugin.meta.author }}
              </span>
              <span
                v-if="plugin.meta.name && plugin.meta.name !== 'unknown'"
                class="font-mono text-gray-500"
              >
                {{ plugin.meta.name }}
              </span>
            </div>

            <div class="flex gap-2">
              <a
                v-if="plugin.meta.homepage"
                :href="plugin.meta.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 hover:text-indigo-400 transition"
                title="Website"
              >
                <UIcon name="GlobeAlt" class="w-5 h-5" />
              </a>
              <a
                v-if="plugin.meta.name && plugin.meta.name !== 'unknown'"
                :href="`https://www.npmjs.com/package/${plugin.meta.name}`"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 hover:text-red-400 transition"
                title="NPM"
              >
                <UIcon name="ArchiveBox" class="w-5 h-5" />
              </a>
              <UButton
                v-if="!plugin.isCore"
                variant="danger"
                size="sm"
                icon="Trash"
                :loading="processing === plugin.meta.name"
                @click="uninstall(plugin.meta.name || plugin.name)"
              >
                Uninstall
              </UButton>
            </div>
          </div>
        </div>

        <UEmpty
          v-if="!loading && installedPlugins.length === 0"
          title="No plugins installed"
          icon="Cube"
        />
      </div>

      <!-- LIST: Marketplace -->
      <div v-if="activeTab === 'Marketplace'" class="space-y-4">
        <div
          v-for="p in marketPlugins"
          :key="p.name"
          class="border border-gray-700 rounded-xl p-5 bg-gray-800 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
        >
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="p-2 rounded-lg bg-indigo-900/30 text-indigo-400"
              >
                <UIcon name="Cube" class="w-6 h-6" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-lg text-white">{{ p.name }}</span>
                  <span
                    class="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400"
                  >
                    v{{ p.version }}
                  </span>
                  <UBadge
                    v-if="isInstalled(p.name)"
                    color="green"
                    size="xs"
                    class="flex items-center gap-1"
                  >
                    <UIcon name="Check" class="w-3 h-3" />
                    Installed
                  </UBadge>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-400 mb-3">{{ p.description }}</p>
            <div class="flex gap-3 text-xs text-gray-400">
              <span class="flex items-center gap-1">
                <UIcon name="User" class="w-3 h-3" />
                {{ p.author }}
              </span>
              <a
                :href="p.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-indigo-400 transition flex items-center gap-1"
              >
                <UIcon name="ArchiveBox" class="w-3 h-3" />
                View on NPM
              </a>
            </div>
          </div>

          <div class="ml-4">
            <UButton
              v-if="!isInstalled(p.name)"
              variant="primary"
              icon="ArrowDownTray"
              :loading="processing === p.name"
              @click="install(p)"
            >
              Install
            </UButton>
          </div>
        </div>

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
    </div>
  </div>
</template>
