<script setup lang="ts">
import { computed } from 'vue';
import { ULoading, UIcon } from '@u-devtools/ui';
import RobotsTester from '../components/RobotsTester.vue';
import SitemapViewer from '../components/SitemapViewer.vue';

const props = defineProps<{
  robotsContent: string;
  sitemapContent: string;
  loading: boolean;
  currentUrl?: string;
}>();

// Extract path from URL
const currentPath = computed(() => {
  if (!props.currentUrl) return '/';
  try {
    const url = new URL(props.currentUrl);
    return url.pathname || '/';
  } catch {
    return '/';
  }
});
</script>

<template>
  <div class="space-y-8 px-4 pt-4 pb-4">
    <!-- Robots Section -->
    <div>
      <h3 class="font-bold text-white mb-3 flex items-center gap-2">
        <UIcon name="DocumentText" /> robots.txt
      </h3>
      <div v-if="loading" class="flex justify-center py-10">
        <ULoading text="Loading robots.txt..." />
      </div>
      <div v-else-if="robotsContent">
        <RobotsTester :content="robotsContent" :current-path="currentPath" />
      </div>
      <div v-else class="p-4 border border-red-900/50 bg-red-900/10 text-red-400 rounded">
        robots.txt not found or unavailable
      </div>
    </div>

    <!-- Sitemap Section -->
    <div>
      <h3 class="font-bold text-white mb-3 flex items-center gap-2">
        <UIcon name="Map" /> sitemap.xml
      </h3>
      <div v-if="loading" class="flex justify-center py-10">
        <ULoading text="Loading sitemap.xml..." />
      </div>
      <div v-else-if="sitemapContent">
        <SitemapViewer :xml-content="sitemapContent" />
      </div>
      <div v-else class="p-4 border border-yellow-900/50 bg-yellow-900/10 text-yellow-400 rounded">
        sitemap.xml not found
      </div>
    </div>
  </div>
</template>

