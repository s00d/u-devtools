<script setup lang="ts">
import { computed } from 'vue';
import { UCard, UButton, UBadge, UKeyValue, UIcon } from '@u-devtools/ui';
import type { PackageMeta, PackageManagerInfo } from '../../types';

const props = defineProps<{
  pkg: PackageMeta;
  manager: PackageManagerInfo;
  isProcessing: boolean;
}>();

const emit = defineEmits<{
  'check-update': [];
  update: [];
  remove: [];
}>();

const hasUpdate = computed(
  () => props.pkg.latestVersion && props.pkg.latestVersion !== props.pkg.installedVersion
);

const repoUrl = computed(() => {
  const url = props.pkg.repository;
  if (!url) return null;
  // Clean git+https://...
  return url.replace(/^git\+/, '').replace(/\.git$/, '');
});

const npmUrl = computed(() => `https://www.npmjs.com/package/${props.pkg.name}`);
</script>

<template>
  <div class="h-full overflow-auto bg-gray-950 p-6 space-y-6">
    
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded bg-white flex items-center justify-center text-red-500 font-bold text-xl shadow-lg border border-gray-200">
          npm
        </div>
        <div>
          <h2 class="text-xl font-bold text-white">{{ pkg.name }}</h2>
          <div class="flex gap-2 mt-1">
            <UBadge color="gray" size="sm">{{ pkg.type }}</UBadge>
            <UBadge v-if="pkg.license" color="blue" size="sm">{{ pkg.license }}</UBadge>
          </div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <a :href="npmUrl" target="_blank" class="p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors">
          <UIcon name="GlobeAlt" class="w-5 h-5" />
        </a>
        <a v-if="repoUrl" :href="repoUrl" target="_blank" class="p-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <UIcon name="CodeBracket" class="w-5 h-5" />
        </a>
      </div>
    </div>

    <!-- Description -->
    <p v-if="pkg.description" class="text-gray-400 text-sm leading-relaxed border-l-2 border-gray-700 pl-3">
      {{ pkg.description }}
    </p>

    <!-- Version Info -->
    <div class="grid grid-cols-2 gap-4">
      <UCard title="Version Info" class="border-gray-800">
        <div class="p-2">
          <UKeyValue label="Requested" :value="pkg.versionRange" />
          <UKeyValue label="Installed" :value="pkg.installedVersion || 'Not installed'" />
          <div class="flex items-start gap-4 py-2 border-b border-zinc-800 last:border-0">
            <div class="font-medium text-gray-400 w-32 shrink-0">Latest</div>
            <div class="flex-1 flex items-center gap-2 min-w-0">
              <span v-if="pkg.latestVersion" class="text-gray-100 font-mono text-sm">{{ pkg.latestVersion }}</span>
              <UButton v-else size="xs" variant="ghost" icon="ArrowPath" @click="emit('check-update')">Check</UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Actions Card -->
      <UCard title="Manage" class="border-gray-800">
        <div class="p-4 space-y-3">
          <UButton 
            v-if="hasUpdate"
            variant="primary" 
            class="w-full justify-center" 
            icon="ArrowUpCircle"
            :loading="isProcessing"
            @click="emit('update')"
          >
            Update to v{{ pkg.latestVersion }}
          </UButton>
          <UButton 
            v-else
            variant="secondary" 
            class="w-full justify-center" 
            disabled
          >
            Up to date
          </UButton>

          <UButton 
            variant="danger" 
            class="w-full justify-center" 
            icon="Trash"
            :loading="isProcessing"
            @click="emit('remove')"
          >
            Uninstall
          </UButton>
          
          <div class="text-xs text-center text-gray-500 mt-2">
            Using {{ manager.name }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Metadata -->
    <UCard title="Details" class="border-gray-800">
      <div class="space-y-2 p-2">
        <UKeyValue v-if="pkg.author" label="Author" :value="pkg.author" />
        <UKeyValue v-if="pkg.homepage" label="Homepage" :value="pkg.homepage" />
        <UKeyValue v-if="pkg.repository" label="Repository" :value="repoUrl || pkg.repository" />
        <div v-if="pkg.bin" class="py-2 border-b border-gray-800">
          <div class="text-gray-400 font-medium mb-1">Binaries</div>
          <div class="flex gap-2">
            <UBadge v-for="(path, name) in pkg.bin" :key="name" color="gray" size="xs">
              {{ name }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

  </div>
</template>

