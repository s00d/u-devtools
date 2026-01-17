<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import {
  UButton,
  UInput,
  UIcon,
  UModal,
  UEmpty,
  UBadge,
  USelect,
  UVirtualList,
} from '@u-devtools/ui';

interface StorageItem {
  key: string | number;
  value: unknown;
  httpOnly?: boolean; // For cookies
}

interface IDBStore {
  name: string;
  entries: StorageItem[];
}

interface IDBDatabase {
  name: string;
  version?: number;
  stores: IDBStore[];
  error?: string;
}

interface CacheEntry {
  name: string;
  entries: StorageItem[];
  error?: string;
}

interface StorageData {
  local: StorageItem[];
  session: StorageItem[];
  cookie: StorageItem[];
  indexeddb: IDBDatabase[];
  cache: CacheEntry[];
  opfs: Array<{ name: string; entries: StorageItem[] }>;
}

import { useBridge, useApi } from '../context';

const bridge = useBridge();
const api = useApi();

// --- State ---
const storageData = ref<StorageData>({
  local: [],
  session: [],
  cookie: [],
  indexeddb: [],
  cache: [],
  opfs: [],
});
const activeType = ref<'local' | 'session' | 'cookie' | 'indexeddb' | 'cache' | 'opfs'>('local');

// For hierarchical storages
const activeDb = ref('');
const activeStore = ref('');

const filter = ref('');
const isModalOpen = ref(false);
const editMode = ref<'add' | 'edit'>('add');
const editingItem = ref<{ key: string | number; value: string }>({ key: '', value: '' });

// --- Computed Data ---
const currentList = computed(() => {
  if (activeType.value === 'indexeddb') {
    const db = storageData.value.indexeddb.find((d) => d.name === activeDb.value);
    if (!db) return [];
    const store = db.stores.find((s) => s.name === activeStore.value);
    return store ? store.entries : [];
  }

  if (activeType.value === 'cache') {
    if (!activeDb.value && storageData.value.cache.length > 0) {
      activeDb.value = storageData.value.cache[0].name;
    }
    const cache = storageData.value.cache.find((c) => c.name === activeDb.value);
    return cache ? cache.entries : [];
  }

  if (activeType.value === 'opfs') {
    return storageData.value.opfs?.[0]?.entries || [];
  }

  return storageData.value[activeType.value] || [];
});

const filteredList = computed(() => {
  const list = currentList.value;
  if (!filter.value) return list;
  const q = filter.value.toLowerCase();
  return list.filter((item: StorageItem) => String(item.key).toLowerCase().includes(q));
});

// Check if element is HttpOnly cookie
const isHttpOnlyCookie = (row: unknown): boolean => {
  return activeType.value === 'cookie' && (row as StorageItem).httpOnly === true;
};

// Automatically select first cache when switching to cache
watch(activeType, (newType) => {
  if (newType === 'cache' && storageData.value.cache.length > 0 && !activeDb.value) {
    activeDb.value = storageData.value.cache[0].name;
  }
  if (newType === 'opfs') {
    activeDb.value = 'root';
  }
});

// --- Actions ---
const refresh = () => bridge.send('refresh');

const save = () => {
  let val = editingItem.value.value;
  // Auto JSON parse
  if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
    try {
      val = JSON.parse(val);
    } catch {}
  }

  bridge.send('save', {
    type: activeType.value,
    db: activeDb.value,
    store: activeStore.value,
    key: editingItem.value.key,
    value: val,
  });
  isModalOpen.value = false;
};

const remove = (key: string | number) => {
  if (!confirm('Delete this item?')) return;
  bridge.send('delete', {
    type: activeType.value,
    db: activeDb.value,
    store: activeStore.value,
    key,
  });
};

const clearAll = () => {
  if (!confirm('Clear all items?')) return;
  bridge.send('clear', {
    type: activeType.value,
    db: activeDb.value,
    store: activeStore.value,
  });
};

const openAdd = () => {
  editMode.value = 'add';
  editingItem.value = { key: '', value: '' };
  isModalOpen.value = true;
};

const openEdit = (item: StorageItem) => {
  editMode.value = 'edit';
  editingItem.value = {
    key: item.key,
    value:
      typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : String(item.value),
  };
  isModalOpen.value = true;
};

onMounted(() => {
  bridge.on('data', (d) => {
    // Приводим тип из протокола к StorageData (протокол имеет stores?:, а StorageData требует stores:)
    const protocolData = d as {
      local: Array<{ key: string; value: unknown }>;
      session: Array<{ key: string; value: unknown }>;
      cookie: Array<{ key: string; value: string; httpOnly: boolean }>;
      indexeddb: Array<{
        name: string;
        version?: number;
        stores?: Array<{ name: string; entries: Array<{ key: unknown; value: unknown }> }>;
        error?: string;
      }>;
      cache: unknown[];
      opfs: unknown[];
    };
    storageData.value = {
      local: protocolData.local,
      session: protocolData.session,
      cookie: protocolData.cookie,
      indexeddb: protocolData.indexeddb.map((db) => ({
        name: db.name,
        version: db.version,
        stores: (db.stores || []).map((store) => ({
          name: store.name,
          entries: store.entries.map((entry) => ({
            key: entry.key as string | number,
            value: entry.value,
          })),
        })),
        error: db.error,
      })),
      cache: protocolData.cache as CacheEntry[],
      opfs: protocolData.opfs as Array<{ name: string; entries: StorageItem[] }>,
    };
  });
  bridge.on('error', (e: string) => {
    api.notify(e, 'error');
  });
  // Load data only on panel mount
  refresh();
});

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
});
</script>

<template>
  <div class="flex h-full w-full flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="CircleStack" class="w-5 h-5" />
            Storage
          </h2>
          <div class="flex items-center gap-2">
            <div class="h-4 w-px bg-gray-700"></div>
            <span class="text-sm text-gray-300">
              <span v-if="activeType === 'indexeddb'">{{ activeDb }} / {{ activeStore }}</span>
              <span v-else-if="activeType === 'local'">Local Storage</span>
              <span v-else-if="activeType === 'session'">Session Storage</span>
              <span v-else-if="activeType === 'cookie'">Cookies</span>
              <span v-else-if="activeType === 'cache'">Cache Storage</span>
              <span v-else-if="activeType === 'opfs'">File System</span>
              <span v-else>{{ activeType }}</span>
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <USelect
            v-if="activeType === 'cache' && storageData.cache.length > 0"
            v-model="activeDb"
            :options="storageData.cache.map(c => ({ label: c.name, value: c.name }))"
            class="w-48"
            size="sm"
          />
          <UInput v-model="filter" placeholder="Filter..." class="w-40" size="sm" />
          <UButton variant="ghost" size="sm" icon="ArrowPath" @click="refresh" />
          <UButton variant="danger" size="sm" icon="Trash" @click="clearAll">Clear</UButton>
          <UButton
            v-if="activeType !== 'cache' && activeType !== 'opfs'"
            variant="primary"
            size="sm"
            icon="Plus"
            @click="openAdd"
          >
            Add
          </UButton>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Sidebar (Navigation) -->
      <div class="w-64 border-r border-gray-700 flex flex-col bg-gray-800 overflow-y-auto">
      <div class="p-3 text-xs font-bold text-gray-400 uppercase">Storage Types</div>

      <!-- Flat Storages -->
      <button
        v-for="type in (['local', 'session', 'cookie'] as const)"
        :key="type"
        @click="activeType = type; activeDb = ''; activeStore = '';"
        class="px-4 py-2 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
        :class="activeType === type ? 'bg-indigo-900/30 text-indigo-300 font-medium' : 'text-gray-300'"
      >
        <span>{{ type === 'local' ? 'Local Storage' : type === 'session' ? 'Session Storage' : 'Cookies' }}</span>
        <UBadge size="xs" color="gray">{{ storageData[type]?.length || 0 }}</UBadge>
      </button>

      <!-- IndexedDB Tree -->
      <div class="mt-4 p-3 text-xs font-bold text-gray-400 uppercase flex justify-between">
        <span>IndexedDB</span>
        <button @click="refresh" class="text-gray-400 hover:text-gray-200">
          <UIcon name="ArrowPath" class="w-3 h-3" />
        </button>
      </div>

      <div v-for="db in storageData.indexeddb" :key="db.name">
        <div class="px-4 py-1 text-sm font-semibold text-gray-300 flex items-center gap-2">
          <UIcon name="CircleStack" class="w-3 h-3" /> {{ db.name }}
        </div>
        <button
          v-for="store in db.stores"
          :key="store.name"
          @click="activeType = 'indexeddb'; activeDb = db.name; activeStore = store.name;"
          class="w-full text-left px-8 py-1.5 text-xs flex justify-between hover:bg-gray-700 border-l-2 transition-colors"
          :class="(activeType === 'indexeddb' && activeStore === store.name && activeDb === db.name)
            ? 'border-indigo-500 bg-gray-700 text-indigo-300'
            : 'border-transparent text-gray-400'"
        >
          <span>{{ store.name }}</span>
          <span class="opacity-60">{{ store.entries.length }}</span>
        </button>
      </div>

      <div v-if="storageData.indexeddb.length === 0" class="px-4 py-2 text-xs text-gray-500 italic">No DBs found</div>

      <!-- Advanced Storages -->
      <div class="mt-4 p-3 text-xs font-bold text-gray-400 uppercase">Advanced</div>

      <button
        @click="activeType = 'cache'; activeDb = ''; activeStore = '';"
        class="px-4 py-2 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
        :class="activeType === 'cache' ? 'bg-indigo-900/30 text-indigo-300 font-medium' : 'text-gray-300'"
      >
        <div class="flex items-center gap-2">
          <UIcon name="Bolt" class="w-4 h-4" /> Cache API
        </div>
      </button>

      <button
        @click="activeType = 'opfs'; activeDb = 'root'; activeStore = '';"
        class="px-4 py-2 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
        :class="activeType === 'opfs' ? 'bg-indigo-900/30 text-indigo-300 font-medium' : 'text-gray-300'"
      >
        <div class="flex items-center gap-2">
          <UIcon name="Folder" class="w-4 h-4" /> File System
        </div>
      </button>
    </div>

      <!-- Main View -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Table Header -->
        <div class="px-4 py-2 border-b border-gray-700 bg-gray-800 grid grid-cols-[25%_50%_80px] gap-4 text-xs font-semibold text-gray-400">
          <div>Key</div>
          <div>Value</div>
          <div class="text-right"></div>
        </div>
        
        <!-- Virtual List -->
        <div class="flex-1 min-h-0 bg-gray-900/50">
          <UVirtualList
            v-if="filteredList.length > 0"
            :items="filteredList"
            :item-height="80"
            :key-field="(item: unknown) => (item as StorageItem).key"
            class="h-full"
          >
            <template #default="{ item }">
              <div class="px-4 py-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors grid grid-cols-[25%_50%_80px] gap-4 items-start">
                <!-- Key Column -->
                <div class="flex items-center gap-2 min-w-0">
                  <span class="font-mono text-sm font-bold text-indigo-400 break-all">{{ (item as StorageItem).key }}</span>
                  <UBadge
                    v-if="isHttpOnlyCookie(item as StorageItem)"
                    color="yellow"
                    size="xs"
                    title="HttpOnly (Server side)"
                  >
                    HTTP
                  </UBadge>
                </div>
                
                <!-- Value Column -->
                <div
                  @dblclick.stop="openEdit(item as StorageItem)"
                  class="text-xs font-mono text-gray-300 cursor-pointer hover:text-indigo-400 transition-colors group relative w-full"
                  :title="typeof (item as StorageItem).value === 'object' ? JSON.stringify((item as StorageItem).value, null, 2) : String((item as StorageItem).value)"
                >
                  <div class="max-h-20 overflow-hidden wrap-break-word">
                    <span v-if="typeof (item as StorageItem).value === 'object'" class="whitespace-pre-wrap break-all">{{ JSON.stringify((item as StorageItem).value, null, 2) }}</span>
                    <span v-else class="break-all">{{ String((item as StorageItem).value) }}</span>
                  </div>
                  <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-gray-800/90 rounded text-[10px] text-indigo-400 pointer-events-none z-10">
                    Double-click to edit
                  </div>
                </div>
                
                <!-- Actions Column -->
                <div class="flex justify-end gap-1">
                  <button
                    v-if="activeType !== 'cache' && activeType !== 'opfs'"
                    @click="openEdit(item as StorageItem)"
                    class="p-1 text-gray-400 hover:text-indigo-400"
                  >
                    <UIcon name="Pencil" class="w-4 h-4"/>
                  </button>
                  <button
                    @click="remove((item as StorageItem).key)"
                    class="p-1 text-gray-400 hover:text-red-400"
                  >
                    <UIcon name="Trash" class="w-4 h-4"/>
                  </button>
                </div>
              </div>
            </template>
            <template #empty>
              <div class="p-4">
                <UEmpty icon="CircleStack" title="Storage is empty" description="No items found in this storage" />
              </div>
            </template>
          </UVirtualList>
          <div v-else class="p-4">
            <UEmpty icon="CircleStack" title="Storage is empty" description="No items found in this storage" />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UModal :visible="isModalOpen" :title="editMode === 'add' ? 'Add Item' : 'Edit Item'" @close="isModalOpen = false">
      <div class="space-y-4">
        <div>
          <label class="text-sm font-bold text-gray-200">Key</label>
          <UInput
            v-model="editingItem.key"
            :disabled="editMode === 'edit' && activeType !== 'indexeddb'"
          />
        </div>
        <div>
          <label class="text-sm font-bold text-gray-200">Value (JSON supported)</label>
          <textarea
            v-model="editingItem.value"
            class="w-full h-32 p-2 border border-gray-600 rounded bg-gray-800 text-gray-200 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          ></textarea>
        </div>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" @click="isModalOpen = false">Cancel</UButton>
          <UButton variant="primary" @click="save">Save</UButton>
        </div>
      </div>
    </UModal>

  </div>
</template>
