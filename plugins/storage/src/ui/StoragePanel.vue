<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import { UTable, UButton, UBadge, UTabs, UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  api: ClientApi;
  onRegisterClear: (fn: () => void) => void;
}>();

interface StorageItem {
  key: string;
  value: string;
}

interface StorageData {
  localStorage: StorageItem[];
  sessionStorage: StorageItem[];
  cookies: StorageItem[];
}

const activeTab = ref<'localStorage' | 'sessionStorage' | 'cookies'>('localStorage');
const storageData = ref<StorageData>({
  localStorage: [],
  sessionStorage: [],
  cookies: [],
});

const bridge = new AppBridge<StorageData>('storage');

const currentItems = computed(() => {
  return storageData.value[activeTab.value] || [];
});

const clear = () => {
  if (activeTab.value === 'localStorage') {
    window.localStorage.clear();
  } else if (activeTab.value === 'sessionStorage') {
    window.sessionStorage.clear();
  } else if (activeTab.value === 'cookies') {
    document.cookie.split(';').forEach((cookie) => {
      const key = cookie.trim().split('=')[0];
      document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    });
  }
  props.api.notify(`Cleared ${activeTab.value}`, 'success');
};

const deleteItem = (key: string) => {
  if (activeTab.value === 'localStorage') {
    window.localStorage.removeItem(key);
  } else if (activeTab.value === 'sessionStorage') {
    window.sessionStorage.removeItem(key);
  } else if (activeTab.value === 'cookies') {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
  props.api.notify(`Deleted ${key}`, 'success');
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = bridge.on<StorageData>('storage:data', (data) => {
    storageData.value = data;
  });

  props.onRegisterClear(clear);
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
  bridge.close();
});
</script>

<template>
  <div class="h-full flex flex-col bg-udt-c-bg text-udt-c-text">
    <!-- Toolbar -->
    <div class="p-4 border-b border-udt-c-border bg-gray-50 dark:bg-gray-800 flex gap-2 items-center">
      <UTabs
        :items="['localStorage', 'sessionStorage', 'cookies']"
        :model-value="activeTab"
        @update:model-value="(v) => activeTab = v as typeof activeTab"
      />
      <UButton variant="danger" icon="Trash" size="sm" @click="clear" class="ml-auto">
        Clear All
      </UButton>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <UTable
        :rows="currentItems"
        :columns="[
          { key: 'key', label: 'Key' },
          { key: 'value', label: 'Value' },
          { key: 'actions', label: '', width: '100px' },
        ]"
      >
        <template #cell-key="{ val }">
          <div class="font-mono text-sm font-bold">{{ val }}</div>
        </template>

        <template #cell-value="{ val }">
          <div class="font-mono text-xs max-w-md truncate" :title="val as string">
            {{ val }}
          </div>
        </template>

        <template #cell-actions="{ row }">
          <UButton
            variant="ghost"
            icon="Trash"
            size="sm"
            @click="deleteItem((row as StorageItem).key)"
            title="Delete"
          />
        </template>
      </UTable>

      <UEmpty v-if="currentItems.length === 0" icon="ServerStack" :title="`No items in ${activeTab}`" description="Storage items will appear here when they are created" />
    </div>
  </div>
</template>

