---
to: <%= projectName %>/src/ui/SidebarPanel.vue
---
<% if (features && features.includes('sidebar')) { -%>
<script setup lang="ts">
import { computed } from 'vue';
import type { ClientApi } from '@u-devtools/core';

const props = defineProps<{
  api: ClientApi;
}>();

<% if (features.includes('settings')) { -%>
// Access settings reactively
const enabled = computed(() => props.api.settings.get('enabled', true));
const refreshInterval = computed(() => props.api.settings.get('refreshInterval', 1000));
<% } -%>
</script>

<template>
  <div class="p-4 space-y-4">
    <h2 class="text-lg font-semibold">Sidebar</h2>
    
<% if (features.includes('settings')) { -%>
    <div class="space-y-2 text-sm">
      <div>
        <span class="text-gray-400">Enabled:</span>
        <span class="ml-2" :class="enabled ? 'text-green-400' : 'text-red-400'">
          {{ enabled ? 'Yes' : 'No' }}
        </span>
      </div>
      
      <div>
        <span class="text-gray-400">Refresh Interval:</span>
        <span class="ml-2 text-gray-200">{{ refreshInterval }}ms</span>
      </div>
    </div>
<% } else { -%>
    <p class="text-sm text-gray-400">Sidebar panel</p>
<% } -%>
  </div>
</template>
<% } -%>
