<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { UButton, UCard, USplitter, ULoading, UIcon, UTabs, UBadge } from '@u-devtools/ui';
import type { ClientApi } from '@u-devtools/core';
import { AppBridge } from '@u-devtools/core';
import type { SeoTags, ServerCheckData } from '../types';
import AnalysisReport from './AnalysisReport.vue';
import { compareSeo, type DiffResult } from '../utils/diff';
import type { RouteReport } from '../types';
// Tab components
import SocialPreviewTab from './tabs/SocialPreviewTab.vue';
import StructuredDataTab from './tabs/StructuredDataTab.vue';
import ContentTab from './tabs/ContentTab.vue';
import TechnicalTab from './tabs/TechnicalTab.vue';
import SsrMismatchTab from './tabs/SsrMismatchTab.vue';
import UnlighthouseTab from './tabs/UnlighthouseTab.vue';
import ServerConfigTab from './tabs/ServerConfigTab.vue';
import LinkAuditor from './components/LinkAuditor.vue';

interface RobotsCheckResult {
  isAllowed: boolean;
  reason?: string;
  rules?: any;
}

import { useBridge, useApi } from '../context';

const bridge = useBridge();
const api = useApi();
const seoData = ref<SeoTags | null>(null);
const serverData = ref<ServerCheckData | null>(null);
const loading = ref(false);
const activeTab = ref('Social Previews');
const tabs = [
  'Social Previews',
  'Structured Data',
  'Content',
  'Technical',
  'Link Health',
  'SSR Mismatch',
  'Unlighthouse',
  'Server Config',
];

const ssrDiffs = ref<DiffResult[]>([]);
const isComparing = ref(false);
const robotsCheck = ref<RobotsCheckResult | null>(null);
const unlighthouseReports = ref<RouteReport[]>([]);
const isUnlighthouseScanning = ref(false);
const robotsContent = ref('');
const sitemapContent = ref('');
const loadingConfig = ref(false);
const currentPageUrl = ref<string>(''); // Store current page URL from payload

const startUnlighthouseScan = async () => {
  isUnlighthouseScanning.value = true;
  // Use origin from saved URL or fallback to window.location.origin
  const url = currentPageUrl.value ? new URL(currentPageUrl.value).origin : window.location.origin;

  try {
    await api.rpc.call('seo:unlighthouse-start', url);
    api.notify('Unlighthouse scan started', 'success');
    // Clear old reports on new scan
    unlighthouseReports.value = [];
  } catch (e: unknown) {
    api.notify(
      `Failed to start: ${e instanceof Error ? e.message : 'Unknown error'}`,
      'error'
    );
    isUnlighthouseScanning.value = false;
  }
};

const updateUnlighthouseReport = (data: any) => {
  const idx = unlighthouseReports.value.findIndex((r) => r.path === data.path);
  const newReport: RouteReport = {
    id: data.path,
    path: data.path,
    status: data.status,
    score: data.score,
    seo: data.seo,
  };

  if (idx !== -1) {
    unlighthouseReports.value[idx] = {
      ...unlighthouseReports.value[idx],
      ...newReport,
    };
  } else {
    unlighthouseReports.value.push(newReport);
  }
};

const refresh = () => {
  loading.value = true;
  bridge.send('scan');
};

const copyAuditReport = () => {
  if (!seoData.value) {
    api.notify('No data available', 'info');
    return;
  }

  const report = `
# SEO Audit Report
**URL:** ${currentPageUrl.value || 'N/A'}
**Date:** ${new Date().toLocaleString()}

## Basic Meta Tags
- **Title:** ${seoData.value.title ? '✅' : '❌'} ${seoData.value.title || 'Missing'}
- **Description:** ${seoData.value.description ? '✅' : '❌'} ${seoData.value.description || 'Missing'}
- **Canonical:** ${seoData.value.canonical ? '✅' : '❌'} ${seoData.value.canonical || 'Missing'}
- **Robots:** ${seoData.value.robots || 'Not set'}

## Open Graph
- **OG Title:** ${seoData.value.ogTitle ? '✅' : '❌'} ${seoData.value.ogTitle || 'Missing'}
- **OG Description:** ${seoData.value.ogDescription ? '✅' : '❌'} ${seoData.value.ogDescription || 'Missing'}
- **OG Image:** ${seoData.value.ogImage ? '✅' : '❌'} ${seoData.value.ogImage || 'Missing'}

## Content Analysis
- **Headings:** ${seoData.value.headings?.length || 0} found
- **Images:** ${seoData.value.images?.length || 0} found
  - Missing alt: ${seoData.value.images?.filter((img) => !img.alt).length || 0}
  - Issues: ${seoData.value.images?.filter((img) => img.issue).length || 0}

## Structured Data
- **JSON-LD Items:** ${seoData.value.jsonLd?.length || 0}
  - Valid: ${seoData.value.jsonLd?.filter((item) => item.isValidJson).length || 0}
  - Errors: ${seoData.value.jsonLd?.filter((item) => item.errors.length > 0).length || 0}

## Server Files
- **robots.txt:** ${serverData.value?.robots.exists ? (serverData.value.robots.warning ? '⚠️ INVALID' : '✅ FOUND') : '❌ MISSING'}
- **sitemap.xml:** ${serverData.value?.sitemap.exists ? (serverData.value.sitemap.warning ? '⚠️ INVALID' : '✅ FOUND') : '❌ MISSING'}

## Links
- **Total Links:** ${seoData.value.links?.length || 0}
- **External Links:** ${seoData.value.links?.filter((l) => l.isExternal).length || 0}
- **Security Issues:** ${seoData.value.links?.filter((l) => l.issue).length || 0}

---
Generated by U-DevTools SEO Studio
  `.trim();

  navigator.clipboard
    .writeText(report)
    .then(() => {
      api.notify('Audit report copied to clipboard', 'success');
    })
    .catch(() => {
      api.notify('Failed to copy report', 'error');
    });
};

const loadServerConfigs = async (baseUrl: string) => {
  loadingConfig.value = true;
  const clean = baseUrl.replace(/\/$/, '');

  // Load in parallel
  const [rob, site] = await Promise.all([
    api.rpc.call<{ success: boolean; content: string }>(
      'seo:fetch-file',
      `${clean}/robots.txt`
    ),
    api.rpc.call<{ success: boolean; content: string }>(
      'seo:fetch-file',
      `${clean}/sitemap.xml`
    ),
  ]);

  if (rob.success) robotsContent.value = rob.content;
  if (site.success) sitemapContent.value = site.content;

  loadingConfig.value = false;
};

// Function to start SSR/CSR comparison
const runSsrCheck = async (clientTags: SeoTags, url: string) => {
  isComparing.value = true;
  try {
    // 1. Ask server to download raw HTML
    const res = await api.rpc.call<{
      success: boolean;
      html: string;
      error?: string;
    }>('seo:get-raw-html', url);

    if (res.success && res.html) {
      // 2. Compare on client
      ssrDiffs.value = compareSeo(clientTags, res.html);
    } else {
      api.notify(`Failed to fetch server HTML: ${res.error || 'Unknown error'}`, 'error');
      ssrDiffs.value = [];
    }
  } catch (e) {
    console.error('[U-DevTools:SEO] SSR check error:', e);
    api.notify('SSR check failed', 'error');
    ssrDiffs.value = [];
  } finally {
    isComparing.value = false;
  }
};

onMounted(() => {
  bridge.on('scan-result', async (payload: { tags: SeoTags; url: string }) => {
    seoData.value = payload.tags;

    // IMPORTANT: Save URL from App context for use in Re-check
    if (payload.url) {
      currentPageUrl.value = payload.url;
    }

    // After receiving data from App, request server check
    if (payload.url) {
      try {
        // Extract origin from URL for server file checks
        const urlObj = new URL(payload.url);
        const baseUrl = urlObj.origin;

        const res = await api.rpc.call<ServerCheckData>('seo:check-server-files', baseUrl);
        serverData.value = res;

        // Check robots.txt for current URL
        if (res.robots.exists && res.robots.contentSnippet) {
          try {
            // Get full robots.txt
            const robotsRes = await fetch(`${baseUrl}/robots.txt`);
            if (robotsRes.ok) {
              const robotsTxt = await robotsRes.text();
              const robotsCheckRes = await api.rpc.call<RobotsCheckResult>(
                'seo:check-robots',
                { url: payload.url, robotsTxt } // Use URL from payload, not window.location.href
              );
              robotsCheck.value = robotsCheckRes;
            }
          } catch (e) {
            console.error('[U-DevTools:SEO] Robots check failed', e);
          }
        }
      } catch (e) {
        console.error('[U-DevTools:SEO] Server check failed', e);
      }

      // Run SSR check automatically on data update
      await runSsrCheck(payload.tags, payload.url);

      // Load server configs (use origin for robots.txt and sitemap.xml)
      const urlObj = new URL(payload.url);
      await loadServerConfigs(urlObj.origin);
    }

    loading.value = false;
  });

  // Load existing Unlighthouse reports
  (async () => {
    try {
      const existing = await api.rpc.call<RouteReport[]>('seo:unlighthouse-get-reports');
      unlighthouseReports.value = existing;
    } catch (e) {
      // Unlighthouse may not be installed
      console.warn('[U-DevTools:SEO] Unlighthouse not available');
    }
  })();

  // Listen for Unlighthouse updates
  const unsubUpdate = api.rpc.on('seo:unlighthouse-update', (data: any) => {
    isUnlighthouseScanning.value = true;
    updateUnlighthouseReport(data);
  });

  const unsubFinish = api.rpc.on('seo:unlighthouse-finished', () => {
    isUnlighthouseScanning.value = false;
    api.notify('Unlighthouse scan completed', 'success');
  });

  refresh();

  // Cleanup
  onUnmounted(() => {
    if (unsubUpdate) unsubUpdate();
    if (unsubFinish) unsubFinish();
  });
});

onUnmounted(() => {
  // Только отписываемся от событий.
  // НЕ вызываем bridge.close() здесь! Это убьет плагин до перезагрузки страницы.
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div
        class="p-3 flex justify-between items-center"
      >
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="PresentationChartLine" class="w-5 h-5" />
            SEO Studio
          </h2>
          <div v-if="seoData" class="flex items-center gap-2">
            <div class="h-4 w-px bg-gray-700"></div>
            <UTabs
              :items="tabs"
              :model-value="activeTab"
              :max-visible="5"
              @update:model-value="activeTab = $event"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            size="sm"
            icon="Clipboard"
            variant="ghost"
            @click="copyAuditReport"
            title="Copy Audit Report"
          >
            Copy Report
          </UButton>
          <UButton size="sm" icon="ArrowPath" :loading="loading" @click="refresh">
            Refresh
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="seoData" class="flex-1 overflow-hidden relative">
      <USplitter :default-size="450" :min="350">
        <!-- LEFT: Analysis & Inputs (Read Only view for now) -->
        <template #left>
          <div class="h-full overflow-auto p-4 space-y-6">
            <!-- Health Score (Analysis) -->
            <UCard title="Analysis" class="border-gray-800">
              <AnalysisReport :data="seoData" />
            </UCard>

            <!-- Server Files -->
            <UCard title="Server Files" class="border-gray-800">
              <div class="space-y-3">
                <div
                  class="flex justify-between items-center text-sm p-2 rounded bg-gray-800 border border-gray-700"
                >
                  <span class="font-mono text-gray-400">robots.txt</span>
                  <div class="flex items-center gap-2" v-if="serverData?.robots">
                    <!-- Status -->
                    <span
                      class="px-2 py-0.5 rounded text-xs font-bold"
                      :class="{
                        'bg-green-900 text-green-400': serverData.robots.exists && !serverData.robots.warning,
                        'bg-yellow-900 text-yellow-400': serverData.robots.exists && serverData.robots.warning,
                        'bg-red-900 text-red-400': !serverData.robots.exists
                      }"
                    >
                      {{ serverData.robots.exists ? (serverData.robots.warning ? 'INVALID' : 'FOUND') : 'MISSING' }}
                    </span>

                    <!-- Error details -->
                    <span v-if="serverData.robots.error" class="text-xs text-red-400" :title="serverData.robots.error">
                      {{ serverData.robots.error.includes('SPA') ? 'SPA Fallback (HTML)' : 'Not Found' }}
                    </span>
                    
                    <!-- Success details -->
                    <span v-else-if="serverData.robots.warning" class="text-xs text-yellow-400" :title="serverData.robots.warning">
                      {{ serverData.robots.warning }}
                    </span>
                    <span v-else class="text-xs text-gray-500">{{ serverData.robots.size }}b</span>
                  </div>
                  <ULoading v-else size="sm" />
                </div>

                <!-- Robots.txt Status for Current URL -->
                <div
                  v-if="robotsCheck"
                  class="p-2 rounded bg-gray-800 border border-gray-700"
                >
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs text-gray-400">Current URL Status</span>
                    <UBadge
                      :color="robotsCheck.isAllowed ? 'green' : 'red'"
                      size="xs"
                    >
                      {{ robotsCheck.isAllowed ? '✅ Allowed' : '❌ Blocked' }}
                    </UBadge>
                  </div>
                  <div
                    v-if="robotsCheck.reason"
                    class="text-xs text-gray-500 mt-1"
                  >
                    {{ robotsCheck.reason }}
                  </div>
                </div>

                <div
                  class="flex justify-between items-center text-sm p-2 rounded bg-gray-800 border border-gray-700"
                >
                  <span class="font-mono text-gray-400">sitemap.xml</span>
                  <div class="flex items-center gap-2" v-if="serverData?.sitemap">
                    <!-- Status -->
                    <span
                      class="px-2 py-0.5 rounded text-xs font-bold"
                      :class="{
                        'bg-green-900 text-green-400': serverData.sitemap.exists && !serverData.sitemap.warning,
                        'bg-yellow-900 text-yellow-400': serverData.sitemap.exists && serverData.sitemap.warning,
                        'bg-red-900 text-red-400': !serverData.sitemap.exists
                      }"
                    >
                      {{ serverData.sitemap.exists ? (serverData.sitemap.warning ? 'INVALID' : 'FOUND') : 'MISSING' }}
                    </span>

                    <!-- Error details -->
                    <span v-if="serverData.sitemap.error" class="text-xs text-red-400" :title="serverData.sitemap.error">
                      {{ serverData.sitemap.error.includes('SPA') ? 'SPA Fallback (HTML)' : 'Not Found' }}
                    </span>
                    
                    <!-- Success details -->
                    <span v-else-if="serverData.sitemap.warning" class="text-xs text-yellow-400" :title="serverData.sitemap.warning">
                      {{ serverData.sitemap.warning }}
                    </span>
                    <span v-else class="text-xs text-gray-500">{{ serverData.sitemap.size }}b</span>
                  </div>
                  <ULoading v-else size="sm" />
                </div>
              </div>
            </UCard>

            <!-- Raw Data -->
            <UCard title="Meta Tags" class="border-gray-800">
              <div class="space-y-3">
                <template
                  v-for="(val, key) in seoData"
                  :key="key"
                >
                  <div
                    v-if="
                      !['jsonLd', 'hreflangs', 'favicon', 'appleTouchIcon'].includes(
                        key
                      )
                    "
                  >
                    <label class="text-xs text-gray-500 uppercase font-bold">{{ key }}</label>
                    <div
                      class="text-sm bg-black/20 p-2 rounded border border-gray-700/50 break-all font-mono text-gray-300"
                    >
                      {{ val || '-' }}
                    </div>
                  </div>
                </template>
              </div>
            </UCard>
          </div>
        </template>

        <!-- RIGHT: Live Previews -->
        <template #right>
          <div class="h-full flex flex-col bg-gray-950">
            <div class="flex-1 overflow-auto bg-gray-950 px-4 pt-4">
              <!-- SOCIAL PREVIEWS -->
              <SocialPreviewTab
                v-if="activeTab === 'Social Previews'"
                :data="seoData"
              />

              <!-- STRUCTURED DATA TAB -->
              <StructuredDataTab
                v-if="activeTab === 'Structured Data'"
                :data="seoData"
              />

              <!-- CONTENT TAB -->
              <ContentTab
                v-if="activeTab === 'Content'"
                :data="seoData"
              />

              <!-- TECHNICAL TAB -->
              <TechnicalTab
                v-if="activeTab === 'Technical'"
                :data="seoData"
                :current-url="currentPageUrl"
              />

              <!-- LINK HEALTH TAB -->
              <div v-if="activeTab === 'Link Health'" class="pb-4">
                <LinkAuditor :links="seoData.links || []" />
              </div>

              <!-- SSR MISMATCH TAB -->
              <SsrMismatchTab
                v-if="activeTab === 'SSR Mismatch'"
                :diffs="ssrDiffs"
                :is-comparing="isComparing"
                :on-refresh="refresh"
              />

              <!-- UNLIGHTHOUSE TAB -->
              <UnlighthouseTab
                v-if="activeTab === 'Unlighthouse'"
                :reports="unlighthouseReports"
                :is-scanning="isUnlighthouseScanning"
                :on-start-scan="startUnlighthouseScan"
              />

              <!-- SERVER CONFIG TAB -->
              <ServerConfigTab
                v-if="activeTab === 'Server Config'"
                :robots-content="robotsContent"
                :sitemap-content="sitemapContent"
                :loading="loadingConfig"
                :current-url="currentPageUrl"
              />
            </div>
          </div>
        </template>
      </USplitter>
    </div>

    <div v-else class="flex-1 flex items-center justify-center">
      <ULoading size="lg" text="Scanning page..." />
    </div>
  </div>
</template>

