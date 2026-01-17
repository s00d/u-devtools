<script setup lang="ts">
import { computed } from 'vue';
import { UBadge, UIcon, UCard } from '@u-devtools/ui';

const props = defineProps<{
  headers: Record<string, string>;
  status: number;
}>();

const seoHeaders = computed(() => {
  const list: {
    key: string;
    val: string;
    status: 'ok' | 'warn' | 'error';
    description?: string;
  }[] = [];

  // 1. X-Robots-Tag (critical for SEO)
  const robots = props.headers['x-robots-tag'];
  if (robots) {
    const robotsLower = robots.toLowerCase();
    if (robotsLower.includes('noindex') || robotsLower.includes('none')) {
      list.push({
        key: 'x-robots-tag',
        val: robots,
        status: 'error',
        description: 'This header blocks search engine indexing!',
      });
    } else if (robotsLower.includes('noarchive') || robotsLower.includes('nosnippet')) {
      list.push({
        key: 'x-robots-tag',
        val: robots,
        status: 'warn',
        description: 'This header limits how search engines display your page',
      });
    } else {
      list.push({
        key: 'x-robots-tag',
        val: robots,
        status: 'ok',
      });
    }
  }

  // 2. Canonical Link Header (rare, but happens)
  const link = props.headers['link'];
  if (link && link.includes('rel="canonical"')) {
    list.push({
      key: 'link (canonical)',
      val: link,
      status: 'ok',
      description: 'Canonical URL specified in HTTP header',
    });
  }

  // 3. Cache-Control (important for crawling)
  const cache = props.headers['cache-control'];
  if (cache) {
    const cacheLower = cache.toLowerCase();
    if (cacheLower.includes('no-cache') || cacheLower.includes('no-store')) {
      list.push({
        key: 'cache-control',
        val: cache,
        status: 'warn',
        description: 'Page may not be cached, which can slow down crawlers',
      });
    } else {
      list.push({
        key: 'cache-control',
        val: cache,
        status: 'ok',
      });
    }
  }

  // 4. Vary (User-Agent) - important for mobile indexing
  const vary = props.headers['vary'];
  if (vary) {
    const varyLower = vary.toLowerCase();
    if (varyLower.includes('user-agent')) {
      list.push({
        key: 'vary',
        val: vary,
        status: 'ok',
        description: 'Content varies by User-Agent (good for mobile SEO)',
      });
    } else {
      list.push({
        key: 'vary',
        val: vary,
        status: 'ok',
      });
    }
  }

  // 5. Content-Type (check for correct type)
  const contentType = props.headers['content-type'];
  if (contentType) {
    if (!contentType.includes('text/html')) {
      list.push({
        key: 'content-type',
        val: contentType,
        status: 'warn',
        description: 'Not HTML content type',
      });
    } else {
      list.push({
        key: 'content-type',
        val: contentType,
        status: 'ok',
      });
    }
  }

  // 6. X-Content-Type-Options (security, but affects SEO)
  const contentTypeOptions = props.headers['x-content-type-options'];
  if (contentTypeOptions) {
    list.push({
      key: 'x-content-type-options',
      val: contentTypeOptions,
      status: 'ok',
    });
  }

  // 7. Content-Language (for multilingual sites)
  const contentLanguage = props.headers['content-language'];
  if (contentLanguage) {
    list.push({
      key: 'content-language',
      val: contentLanguage,
      status: 'ok',
      description: 'Page language specified in header',
    });
  }

  // 8. X-Frame-Options (security)
  const frameOptions = props.headers['x-frame-options'];
  if (frameOptions) {
    list.push({
      key: 'x-frame-options',
      val: frameOptions,
      status: 'ok',
    });
  }

  return list;
});

const allHeaders = computed(() => {
  return Object.entries(props.headers)
    .filter(([key]) => !seoHeaders.value.some((h) => h.key.toLowerCase() === key.toLowerCase()))
    .map(([key, val]) => ({ key, val }));
});
</script>

<template>
  <div class="space-y-4">
    <!-- Status Badge -->
    <div class="flex items-center gap-4 p-4 bg-gray-800 rounded border border-gray-700">
      <div class="text-sm text-gray-400">Response Status</div>
      <UBadge :color="status === 200 ? 'green' : status >= 300 && status < 400 ? 'yellow' : 'red'" size="md">
        {{ status }}
      </UBadge>
      <span v-if="status !== 200" class="text-xs text-gray-500">
        {{ status === 301 || status === 302 ? 'Redirect' : status === 404 ? 'Not Found' : 'Error' }}
      </span>
    </div>

    <!-- SEO Headers -->
    <UCard title="SEO Headers" class="border-gray-800">
      <div v-if="seoHeaders.length === 0" class="text-gray-500 text-sm italic px-4 py-4">
        No specific SEO headers found (which is usually fine).
      </div>
      <div v-else class="space-y-3 px-4 pb-4">
        <div 
          v-for="h in seoHeaders" 
          :key="h.key" 
          class="flex flex-col gap-2 pb-3 border-b border-gray-700/50 last:border-0 last:pb-0"
        >
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold uppercase text-gray-400 font-mono">{{ h.key }}</span>
            <div class="flex items-center gap-2">
              <UBadge 
                :color="h.status === 'error' ? 'red' : h.status === 'warn' ? 'yellow' : 'green'" 
                size="xs"
              >
                {{ h.status === 'error' ? 'Error' : h.status === 'warn' ? 'Warning' : 'OK' }}
              </UBadge>
              <UIcon 
                v-if="h.status === 'error'" 
                name="ExclamationCircle" 
                class="w-4 h-4 text-red-500" 
              />
              <UIcon 
                v-else-if="h.status === 'warn'" 
                name="ExclamationTriangle" 
                class="w-4 h-4 text-yellow-500" 
              />
              <UIcon 
                v-else 
                name="CheckCircle" 
                class="w-4 h-4 text-green-500" 
              />
            </div>
          </div>
          <code class="text-sm font-mono text-gray-200 break-all bg-gray-900/50 p-2 rounded border border-gray-700/50">
            {{ h.val }}
          </code>
          <div v-if="h.description" class="text-xs mt-1" :class="{
            'text-red-400': h.status === 'error',
            'text-yellow-400': h.status === 'warn',
            'text-gray-400': h.status === 'ok'
          }">
            ⚠️ {{ h.description }}
          </div>
        </div>
      </div>
    </UCard>

    <!-- All Headers (collapsible) -->
    <UCard v-if="allHeaders.length > 0" title="All Headers" class="border-gray-800">
      <div class="px-4 pb-4">
        <div class="text-xs text-gray-500 mb-3">
          Other HTTP headers ({{ allHeaders.length }} total)
        </div>
        <div class="space-y-2 max-h-[300px] overflow-y-auto">
          <div 
            v-for="h in allHeaders" 
            :key="h.key" 
            class="flex flex-col gap-1 pb-2 border-b border-gray-700/30 last:border-0 text-sm"
          >
            <span class="text-xs font-bold uppercase text-gray-500 font-mono">{{ h.key }}</span>
            <code class="text-xs font-mono text-gray-300 break-all">{{ h.val }}</code>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

