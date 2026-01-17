<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useApi } from '../context';
import { USplitter, ULoading, UEmpty, UButton, UIcon } from '@u-devtools/ui';
import PackageList from './components/PackageList.vue';
import PackageDetail from './components/PackageDetail.vue';
import type { PackageMeta, PackageManagerInfo } from '../types';

const api = useApi();

const packages = ref<PackageMeta[]>([]);
const manager = ref<PackageManagerInfo>({ name: 'npm', lockfile: '' });
const loading = ref(true);
const selectedName = ref<string | null>(null);
const isProcessing = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const data = await api.rpc.call<{
      packages: PackageMeta[];
      manager: PackageManagerInfo;
      pkgName: string;
      pkgVersion: string;
    }>('pkg:list');
    packages.value = data.packages;
    manager.value = data.manager;

    // Auto check updates for first 10 items? Maybe later.
  } catch (e) {
    api.notify(`Failed to load packages: ${e}`, 'error');
  } finally {
    loading.value = false;
  }
};

const selectedPkg = computed(() => packages.value.find((p) => p.name === selectedName.value));

const handleCheckUpdate = async (name: string) => {
  // Check specifically for this package
  try {
    const updates = await api.rpc.call<Record<string, string>>('pkg:check-latest', [name]);
    if (updates[name]) {
      const idx = packages.value.findIndex((p) => p.name === name);
      if (idx !== -1) {
        packages.value[idx].latestVersion = updates[name];
      }
      api.notify(`Found v${updates[name]}`, 'success');
    } else {
      api.notify('No updates found', 'info');
    }
  } catch {
    api.notify('Failed to check update', 'error');
  }
};

const handleUpdate = async () => {
  if (!selectedPkg.value) return;
  const name = selectedPkg.value.name;
  const isDev = selectedPkg.value.type === 'devDependencies';

  if (!confirm(`Update ${name} to latest version?`)) return;

  isProcessing.value = true;
  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>('pkg:execute', {
      cmd: 'update',
      pkgs: [name],
      dev: isDev,
    });

    if (res.success) {
      api.notify(`Updated ${name}. Reloading...`, 'success');
      await loadData();
    } else {
      api.notify(`Update failed: ${res.error}`, 'error');
    }
  } finally {
    isProcessing.value = false;
  }
};

const handleRemove = async () => {
  if (!selectedPkg.value) return;
  const name = selectedPkg.value.name;

  if (!confirm(`Are you sure you want to uninstall ${name}?`)) return;

  isProcessing.value = true;
  try {
    const res = await api.rpc.call<{ success: boolean; error?: string }>('pkg:execute', {
      cmd: 'uninstall',
      pkgs: [name],
    });

    if (res.success) {
      api.notify(`Uninstalled ${name}`, 'success');
      selectedName.value = null;
      await loadData();
    } else {
      api.notify(`Uninstall failed: ${res.error}`, 'error');
    }
  } finally {
    isProcessing.value = false;
  }
};

const checkAllUpdates = async () => {
  api.notify('Checking for updates...', 'info');
  const names = packages.value.map((p) => p.name);
  const updates = await api.rpc.call<Record<string, string>>('pkg:check-latest', names);

  let count = 0;
  packages.value.forEach((p) => {
    if (updates[p.name]) {
      p.latestVersion = updates[p.name];
      count++;
    }
  });
  api.notify(`Checked. Found ${count} updates.`, 'success');
};

onMounted(loadData);
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="Cube" class="w-5 h-5" />
            Package Inspector
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500 flex items-center mr-2">
            Manager: <span class="text-indigo-400 font-bold ml-1">{{ manager.name }}</span>
          </span>
          <UButton size="sm" variant="ghost" icon="ArrowPath" @click="checkAllUpdates">
            Check Updates
          </UButton>
          <UButton size="sm" variant="ghost" icon="ArrowPath" :loading="loading" @click="loadData">
            Refresh
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <ULoading text="Scanning dependencies..." />
    </div>

    <div v-else class="flex-1 overflow-hidden relative">
      <USplitter :default-size="300" :min="250" :max="500">
        <template #left>
          <PackageList 
            :packages="packages" 
            :selected-name="selectedName" 
            @select="selectedName = $event" 
          />
        </template>
        <template #right>
          <PackageDetail 
            v-if="selectedPkg" 
            :pkg="selectedPkg" 
            :manager="manager"
            :is-processing="isProcessing"
            @check-update="handleCheckUpdate(selectedPkg.name)"
            @update="handleUpdate"
            @remove="handleRemove"
          />
          <div v-else class="h-full flex items-center justify-center text-gray-500 bg-gray-950">
            <UEmpty icon="Cube" title="Select a package" description="View details and manage dependencies" />
          </div>
        </template>
      </USplitter>
    </div>
  </div>
</template>
