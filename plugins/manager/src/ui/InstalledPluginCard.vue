<script setup lang="ts">
import { UButton, UBadge, UIcon } from '@u-devtools/ui';

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

// Function to extract GitHub URL from repository string
const getGitHubUrl = (repository?: string): string | null => {
  if (!repository) return null;

  // Support different formats:
  // - "https://github.com/owner/repo"
  // - "github:owner/repo"
  // - "git+https://github.com/owner/repo.git"
  // - "git@github.com:owner/repo.git"

  const githubMatch = repository.match(/(?:github\.com[/:]|github:)([^/]+)\/([^/]+?)(?:\.git)?$/);

  if (githubMatch) {
    const [, owner, repo] = githubMatch;
    return `https://github.com/${owner}/${repo}`;
  }

  return null;
};

const props = defineProps<{
  plugin: PluginData;
  processing: string | null;
}>();

const emit = defineEmits<{
  uninstall: [pkgName: string];
}>();

const hasUpdate = (current: string, latest?: string) => {
  return latest && current !== latest;
};
</script>

<template>
  <div
    class="border border-white/10 rounded-xl p-5 bg-zinc-900 shadow-sm hover:shadow-md hover:border-white/20 transition-all flex flex-col"
  >
    <div class="flex justify-between items-start mb-3">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-indigo-900/30 text-indigo-400">
          <UIcon name="Cube" class="w-6 h-6" />
        </div>
        <div>
          <h3 class="font-bold text-white text-lg">{{ plugin.name }}</h3>
          <div class="flex items-center gap-2 mt-1">
            <UBadge v-if="plugin.isCore" color="blue" size="xs">CORE</UBadge>
            <UBadge v-else color="gray" size="xs">USER</UBadge>
            <span class="text-xs text-zinc-400 font-mono">v{{ plugin.meta.version }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasUpdate(plugin.meta.version, plugin.latestVersion)" class="flex flex-col items-end">
        <span class="text-xs text-green-400 font-bold mb-1">New version available</span>
        <UBadge color="green" size="xs">v{{ plugin.latestVersion }}</UBadge>
      </div>
    </div>

    <p class="text-zinc-400 text-sm mb-4 flex-1">
      {{ plugin.meta.description || 'No description provided.' }}
    </p>

    <div class="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
      <div class="flex gap-4 text-xs text-zinc-400">
        <span v-if="plugin.meta.author" class="flex items-center gap-1">
          <UIcon name="User" class="w-3 h-3" />
          {{ plugin.meta.author }}
        </span>
        <span
          v-if="plugin.meta.name && plugin.meta.name !== 'unknown'"
          class="font-mono text-zinc-500"
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
          class="text-zinc-500 hover:text-indigo-400 transition-colors"
          title="Website"
        >
          <UIcon name="GlobeAlt" class="w-5 h-5" />
        </a>
        <a
          v-if="getGitHubUrl(plugin.meta.repository)"
          :href="getGitHubUrl(plugin.meta.repository)!"
          target="_blank"
          rel="noopener noreferrer"
          class="text-zinc-500 hover:text-gray-300 transition-colors"
          title="GitHub"
        >
          <UIcon name="CodeBracketSquare" class="w-5 h-5" />
        </a>
        <a
          v-if="plugin.meta.name && plugin.meta.name !== 'unknown'"
          :href="`https://www.npmjs.com/package/${plugin.meta.name}`"
          target="_blank"
          rel="noopener noreferrer"
          class="text-zinc-500 hover:text-red-400 transition-colors"
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
          @click="emit('uninstall', plugin.meta.name || plugin.name)"
        >
          Uninstall
        </UButton>
      </div>
    </div>
  </div>
</template>

