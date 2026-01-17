<script setup lang="ts">
import { computed, ref } from 'vue';
import { UInput, UIcon } from '@u-devtools/ui';
import type { PackageMeta } from '../../types';
import { getVersionColor } from '../../utils/semver';

const props = defineProps<{
  packages: PackageMeta[];
  selectedName: string | null;
}>();

const emit = defineEmits<{
  select: [name: string];
}>();

const search = ref('');
const filterType = ref<string>('all'); // all, dev, prod

const filtered = computed(() => {
  let items = props.packages;

  if (filterType.value === 'prod') items = items.filter((p) => p.type === 'dependencies');
  if (filterType.value === 'dev') items = items.filter((p) => p.type === 'devDependencies');

  if (search.value) {
    const q = search.value.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  return items;
});

const getTypeColor = (type: string) => {
  if (type === 'dependencies') return 'blue';
  if (type === 'devDependencies') return 'yellow';
  return 'gray';
};

const getTypeShort = (type: string) => {
  if (type === 'dependencies') return 'PROD';
  if (type === 'devDependencies') return 'DEV';
  if (type === 'peerDependencies') return 'PEER';
  return 'OPT';
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 border-r border-gray-800">
    <!-- Filters -->
    <div class="p-3 border-b border-gray-800 space-y-2">
      <UInput v-model="search" placeholder="Search..." size="sm" icon="MagnifyingGlass" />
      <div class="flex gap-1">
        <button 
          v-for="f in ['all', 'prod', 'dev']" 
          :key="f"
          class="flex-1 text-xs py-1 rounded border transition-colors uppercase font-bold"
          :class="filterType === f ? 'bg-indigo-900/30 text-indigo-400 border-indigo-800' : 'bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700'"
          @click="filterType = f"
        >
          {{ f }}
        </button>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto">
      <div 
        v-for="pkg in filtered" 
        :key="pkg.name"
        @click="emit('select', pkg.name)"
        class="px-3 py-2 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-between group"
        :class="selectedName === pkg.name ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-200 truncate">{{ pkg.name }}</span>
            <span class="text-[10px] font-bold text-gray-500 border border-gray-700 px-1 rounded">{{ getTypeShort(pkg.type) }}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5 text-xs">
            <span class="font-mono text-gray-500">{{ pkg.installedVersion || '?' }}</span>
            <UIcon v-if="pkg.versionRange.startsWith('^')" name="ArrowUp" class="w-3 h-3 text-gray-600" />
            
            <!-- Update Available Indicator -->
            <span 
              v-if="pkg.latestVersion && pkg.latestVersion !== pkg.installedVersion" 
              class="flex items-center gap-1 font-mono font-bold"
              :class="getVersionColor(pkg.installedVersion || '0.0.0', pkg.latestVersion) === 'red' ? 'text-red-400' : 'text-yellow-400'"
            >
              <UIcon name="ArrowRight" class="w-3 h-3" />
              {{ pkg.latestVersion }}
            </span>
          </div>
        </div>
        
        <UIcon name="ChevronRight" class="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100" />
      </div>
    </div>
  </div>
</template>

