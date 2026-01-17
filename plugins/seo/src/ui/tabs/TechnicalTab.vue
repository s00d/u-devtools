<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { UCard, UIcon, UBadge, ULoading } from '@u-devtools/ui';
import { useApi } from '../../context';
import type { SeoTags } from '../../types';
import HeadersAnalyzer from '../components/HeadersAnalyzer.vue';

const props = defineProps<{
  data: SeoTags;
  currentUrl?: string;
}>();

const api = useApi();

const headersData = ref<{ headers: Record<string, string>; status: number } | null>(null);
const loadingHeaders = ref(false);

const loadHeaders = async () => {
  if (!props.currentUrl) return;

  loadingHeaders.value = true;
  try {
    const result = await api.rpc.call<{
      success: boolean;
      headers?: Record<string, string>;
      status?: number;
      error?: string;
    }>('seo:scan-headers', props.currentUrl);

    if (result.success && result.headers && result.status !== undefined) {
      headersData.value = {
        headers: result.headers,
        status: result.status,
      };
    } else {
      console.warn('[U-DevTools:SEO] Failed to load headers:', result.error);
      headersData.value = null;
    }
  } catch (e) {
    console.error('[U-DevTools:SEO] Headers scan error:', e);
    headersData.value = null;
  } finally {
    loadingHeaders.value = false;
  }
};

onMounted(() => {
  if (props.currentUrl) {
    loadHeaders();
  }
});

// Reload headers on URL change
watch(
  () => props.currentUrl,
  (newUrl) => {
    if (newUrl) {
      loadHeaders();
    } else {
      headersData.value = null;
    }
  }
);
</script>

<template>
  <div class="pb-4 space-y-4">
    <!-- Basic Meta -->
    <UCard title="Basic Meta Tags" class="border-gray-800">
      <div class="space-y-3">
        <div class="flex items-start justify-between gap-4 py-2 px-4 border-b border-gray-800 last:border-0">
          <span class="text-xs text-gray-500 uppercase font-bold min-w-[140px]">Charset</span>
          <span class="text-sm font-mono text-gray-300 flex-1 text-right">{{ data.charset || 'Not set' }}</span>
        </div>
        <div class="flex items-start justify-between gap-4 py-2 px-4 border-b border-gray-800 last:border-0">
          <span class="text-xs text-gray-500 uppercase font-bold min-w-[140px]">Language</span>
          <span class="text-sm font-mono text-gray-300 flex-1 text-right">{{ data.language || 'Not set' }}</span>
        </div>
        <div class="flex items-start justify-between gap-4 py-2 px-4 border-b border-gray-800 last:border-0">
          <span class="text-xs text-gray-500 uppercase font-bold min-w-[140px]">Viewport</span>
          <span class="text-sm font-mono text-gray-300 flex-1 text-right break-all">{{ data.viewport || 'Not set' }}</span>
        </div>
        <div class="flex items-start justify-between gap-4 py-2 px-4 border-b border-gray-800 last:border-0">
          <span class="text-xs text-gray-500 uppercase font-bold min-w-[140px]">Theme Color</span>
          <div class="flex items-center gap-2 flex-1 justify-end">
            <div v-if="data.themeColor" class="w-4 h-4 rounded border border-gray-700" :style="{ backgroundColor: data.themeColor }"></div>
            <span class="text-sm font-mono text-gray-300">{{ data.themeColor || 'Not set' }}</span>
          </div>
        </div>
        <div v-if="data.generator" class="flex items-start justify-between gap-4 py-2 px-4">
          <span class="text-xs text-gray-500 uppercase font-bold min-w-[140px]">Generator</span>
          <span class="text-sm font-mono text-gray-300 flex-1 text-right">{{ data.generator }}</span>
        </div>
      </div>
    </UCard>

    <!-- Canonical -->
    <UCard title="Canonical URL" class="border-gray-800">
      <div class="text-sm font-mono break-all text-gray-300 px-4">
        <span v-if="data.canonical" class="text-blue-400 hover:underline cursor-pointer" :title="data.canonical">{{ data.canonical }}</span>
        <span
          v-else
          class="text-yellow-500 flex items-center gap-2"
        >
          <UIcon name="ExclamationTriangle" class="w-4 h-4" />
          Missing canonical tag
        </span>
      </div>
    </UCard>

    <!-- Hreflangs -->
    <UCard title="Internationalization (hreflang)" class="border-gray-800">
      <div
        v-if="data.hreflangs.length > 0"
        class="space-y-2"
      >
        <div
          v-for="h in data.hreflangs"
          :key="h.lang"
          class="flex items-center justify-between text-sm p-2 px-4 bg-gray-800/50 rounded border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
        >
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <span
              class="font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded text-xs shrink-0"
            >
              {{ h.lang.toUpperCase() }}
            </span>
            <span
              class="text-gray-400 text-xs truncate"
              :title="h.url"
            >
              {{ h.url }}
            </span>
          </div>
          <span
            v-if="h.isSelf"
            class="text-[10px] text-green-400 border border-green-900 px-1.5 rounded bg-green-900/10 shrink-0 ml-2"
          >
            Self
          </span>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 italic px-4">
        No hreflang tags found.
      </div>
    </UCard>

    <!-- Web App Manifest -->
    <UCard title="Web App Manifest" class="border-gray-800">
      <div v-if="data.manifest?.exists" class="space-y-3 px-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Manifest URL</span>
          <a :href="data.manifest.url" target="_blank" class="text-sm font-mono text-blue-400 hover:underline truncate max-w-[400px]" :title="data.manifest.url">
            {{ data.manifest.url }}
          </a>
        </div>
        <div v-if="data.manifest.name" class="flex items-center justify-between">
          <span class="text-sm text-gray-400">App Name</span>
          <span class="text-sm text-gray-300 font-semibold">{{ data.manifest.name }}</span>
        </div>
        <div v-if="data.manifest.shortName" class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Short Name</span>
          <span class="text-sm text-gray-300">{{ data.manifest.shortName }}</span>
        </div>
        <div v-if="data.manifest.themeColor" class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Theme Color</span>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-700" :style="{ backgroundColor: data.manifest.themeColor }"></div>
            <span class="text-sm font-mono text-gray-300">{{ data.manifest.themeColor }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-yellow-500 flex items-center gap-2 px-4">
        <UIcon name="ExclamationTriangle" class="w-4 h-4" />
        No manifest.json found
      </div>
    </UCard>

    <!-- Icons -->
    <UCard title="Icons & Touch Icons" class="border-gray-800">
      <div v-if="data.icons.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4">
        <div
          v-for="(icon, idx) in data.icons"
          :key="idx"
          class="flex flex-col items-center gap-2 p-3 bg-gray-800/50 rounded border border-gray-700/50 hover:bg-gray-800/70 transition-colors"
        >
          <div
            class="w-16 h-16 bg-white rounded border border-gray-700 flex items-center justify-center p-2"
            :class="{
              'bg-gray-800': icon.rel.includes('apple'),
              'bg-black': icon.rel.includes('mask'),
            }"
          >
            <img
              :src="icon.href"
              class="w-full h-full object-contain"
              @error="(e) => { (e.target as HTMLImageElement).style.display = 'none' }"
            />
          </div>
          <div class="text-center w-full">
            <div class="text-xs font-semibold text-gray-300 mb-1">{{ icon.rel }}</div>
            <div v-if="icon.sizes" class="text-[10px] text-gray-500">{{ icon.sizes }}</div>
            <div v-if="icon.type" class="text-[10px] text-gray-500 truncate">{{ icon.type }}</div>
            <div v-if="icon.purpose" class="text-[10px] text-blue-400">{{ icon.purpose }}</div>
          </div>
        </div>
      </div>
      <div v-else class="text-sm text-gray-500 italic px-4">
        No icons found.
      </div>
    </UCard>

    <!-- Performance Hints -->
    <UCard title="Performance Hints" class="border-gray-800">
      <div class="px-4">
        <div v-if="data.dnsPrefetch && data.dnsPrefetch.length > 0" class="mb-4">
          <div class="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
            <UIcon name="GlobeAlt" class="w-3 h-3" />
            DNS Prefetch
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(url, idx) in data.dnsPrefetch"
              :key="idx"
              color="blue"
              size="xs"
              class="font-mono"
            >
              {{ url }}
            </UBadge>
          </div>
        </div>
        <div v-if="data.preconnect && data.preconnect.length > 0">
          <div class="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
            <UIcon name="Link" class="w-3 h-3" />
            Preconnect
          </div>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="(url, idx) in data.preconnect"
              :key="idx"
              color="green"
              size="xs"
              class="font-mono"
            >
              {{ url }}
            </UBadge>
          </div>
        </div>
        <div v-if="(!data.dnsPrefetch || data.dnsPrefetch.length === 0) && (!data.preconnect || data.preconnect.length === 0)" class="text-sm text-gray-500 italic">
          No performance hints found.
        </div>
      </div>
    </UCard>

    <!-- HTTP Headers Analysis -->
    <UCard title="HTTP Headers Analysis" class="border-gray-800">
      <div v-if="loadingHeaders" class="flex justify-center py-10">
        <ULoading text="Scanning headers..." />
      </div>
      <div v-else-if="headersData" class="px-4">
        <HeadersAnalyzer :headers="headersData.headers" :status="headersData.status" />
      </div>
      <div v-else-if="!currentUrl" class="text-sm text-gray-500 italic px-4 py-4">
        URL not available for headers scan.
      </div>
      <div v-else class="text-sm text-gray-500 italic px-4 py-4">
        Failed to load headers. Check console for details.
      </div>
    </UCard>
  </div>
</template>

