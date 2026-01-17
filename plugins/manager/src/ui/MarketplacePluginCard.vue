<script setup lang="ts">
import { UButton, UBadge, UIcon } from '@u-devtools/ui';

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
  plugin: MarketPlugin;
  isInstalled: boolean;
  processing: string | null;
}>();

const emit = defineEmits<{
  install: [plugin: MarketPlugin];
  viewReadme: [plugin: MarketPlugin];
}>();
</script>

<template>
  <div
    class="border border-white/10 rounded-xl p-5 bg-zinc-900 shadow-sm hover:shadow-md hover:border-white/20 transition-all flex justify-between items-center cursor-pointer"
    @click="emit('viewReadme', plugin)"
  >
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 rounded-lg bg-indigo-900/30 text-indigo-400">
          <UIcon name="Cube" class="w-6 h-6" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-lg text-white">{{ plugin.name }}</span>
            <UBadge v-if="plugin.isOfficial" color="blue" size="xs">OFFICIAL</UBadge>
            <span class="text-xs bg-black/30 px-2 py-0.5 rounded text-zinc-400">
              v{{ plugin.version }}
            </span>
            <UBadge
              v-if="isInstalled"
              color="green"
              size="xs"
              class="flex items-center gap-1"
            >
              <UIcon name="Check" class="w-3 h-3" />
              Installed
            </UBadge>
          </div>
          <div class="flex items-center gap-3 mt-2 flex-wrap">
            <UBadge v-if="plugin.downloads" color="gray" size="xs" class="flex items-center gap-1">
              <UIcon name="ArrowDownTray" class="w-3 h-3" />
              {{ plugin.downloads.toLocaleString() }}/week
            </UBadge>
            <UBadge v-if="plugin.stars" color="yellow" size="xs" class="flex items-center gap-1">
              <UIcon name="Star" class="w-3 h-3" />
              {{ plugin.stars.toLocaleString() }}
            </UBadge>
          </div>
        </div>
      </div>
      <p class="text-sm text-zinc-400 mb-3">{{ plugin.description }}</p>
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-2 text-xs text-zinc-400">
          <span class="flex items-center gap-1">
            <UIcon name="User" class="w-3 h-3" />
            {{ plugin.author }}
          </span>
          <a
            v-if="getGitHubUrl(plugin.repository)"
            :href="getGitHubUrl(plugin.repository)!"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-gray-300 transition flex items-center gap-1"
            @click.stop
          >
            <UIcon name="CodeBracketSquare" class="w-3 h-3" />
            GitHub
          </a>
          <a
            :href="plugin.homepage"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-indigo-400 transition flex items-center gap-1"
            @click.stop
          >
            <UIcon name="ArchiveBox" class="w-3 h-3" />
            View on NPM
          </a>
        </div>
        <div v-if="plugin.keywords && plugin.keywords.length > 0" class="flex gap-1 flex-wrap">
          <UBadge
            v-for="keyword in plugin.keywords.slice(0, 3)"
            :key="keyword"
            color="gray"
            size="xs"
          >
            {{ keyword }}
          </UBadge>
        </div>
      </div>
    </div>

    <div class="ml-4 flex gap-2">
      <UButton
        variant="secondary"
        size="sm"
        icon="DocumentText"
        @click.stop="emit('viewReadme', plugin)"
      >
        README
      </UButton>
      <UButton
        v-if="!isInstalled"
        variant="primary"
        icon="ArrowDownTray"
        :loading="processing === plugin.name"
        @click.stop="emit('install', plugin)"
      >
        Install
      </UButton>
    </div>
  </div>
</template>

