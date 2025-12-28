<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { UTable, UInput, UBadge, UTabButtons, ULoading, UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  api: ClientApi;
}>();

interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const packageInfo = ref<PackageInfo | null>(null);
const searchQuery = ref('');
const activeTab = ref<'dependencies' | 'devDependencies' | 'peerDependencies'>('dependencies');
const loading = ref(false);

const loadPackageInfo = async () => {
  loading.value = true;
  try {
    packageInfo.value = await props.api.rpc.call<PackageInfo>('pkg:read');
  } catch (e) {
    props.api.notify(`Failed to load package.json: ${e}`, 'error');
  } finally {
    loading.value = false;
  }
};

const currentDeps = computed(() => {
  if (!packageInfo.value) return [];
  
  const deps = packageInfo.value[activeTab.value === 'dependencies' ? 'dependencies' : activeTab.value === 'devDependencies' ? 'devDependencies' : 'peerDependencies'];
  if (!deps) return [];

  const entries = Object.entries(deps).map(([name, version]) => ({ name, version }));
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return entries.filter(dep => dep.name.toLowerCase().includes(query));
  }
  
  return entries;
});

onMounted(() => {
  loadPackageInfo();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar -->
    <div class="p-4 border-b border-udt-c-border bg-gray-800">
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-1">
          <h2 class="text-lg font-bold mb-1">{{ packageInfo?.name || 'Package' }}</h2>
          <p class="text-sm text-gray-500">Version: {{ packageInfo?.version || '-' }}</p>
        </div>
        <UBadge color="blue">{{ currentDeps.length }} packages</UBadge>
      </div>

      <div class="flex gap-2 items-center">
        <UTabButtons
          :items="['dependencies', 'devDependencies', 'peerDependencies']"
          :model-value="activeTab"
          @update:model-value="(v) => activeTab = v as typeof activeTab"
        />
        <UInput
          v-model="searchQuery"
          placeholder="Search packages..."
          class="flex-1 max-w-xs"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <ULoading v-if="loading" text="Loading packages..." />
      <template v-else>
        <UTable
          v-if="currentDeps.length > 0"
          :rows="currentDeps"
          :columns="[
            { key: 'name', label: 'Package' },
            { key: 'version', label: 'Version' },
          ]"
        >
          <template #cell-name="{ val }">
            <a
              :href="`https://www.npmjs.com/package/${val}`"
              target="_blank"
              class="text-indigo-600 hover:underline font-mono text-sm"
            >
              {{ val }}
            </a>
          </template>

          <template #cell-version="{ val }">
            <span class="font-mono text-xs text-gray-600">{{ val }}</span>
          </template>
        </UTable>

        <UEmpty
          v-else
          icon="Cube"
          :title="`No ${activeTab} found`"
          description="This package has no dependencies in this category"
        />
      </template>
    </div>
  </div>
</template>

