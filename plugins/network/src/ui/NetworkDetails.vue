<script setup lang="ts">
import { ref, computed } from 'vue';
import { UTabs, UJsonTree, UKeyValue, UButton, UCodeBlock, UIcon } from '@u-devtools/ui';

const props = defineProps<{
  request: {
    id: string;
    url: string;
    method: string;
    status?: number;
    statusText?: string;
    requestHeaders?: Record<string, string>;
    requestBody?: unknown;
    responseHeaders?: Record<string, string>;
    responseBody?: unknown;
    duration?: number;
  };
}>();

const emit = defineEmits(['close', 'replay']);

const activeTab = ref('Headers');

const tabs = ['Headers', 'Payload', 'Response'];

const requestHeaders = computed(() => Object.entries(props.request.requestHeaders || {}));
const responseHeaders = computed(() => Object.entries(props.request.responseHeaders || {}));
const hasBody = computed(() => !!props.request.requestBody);

const isJson = (data: unknown) =>
  (typeof data === 'object' && data !== null && !Array.isArray(data)) || Array.isArray(data);
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200 border-l border-gray-700">
    <!-- Header -->
    <div class="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
      <div class="font-bold text-sm truncate max-w-[300px] text-white" :title="request.url">
        {{ request.url.split('/').pop() || request.url }}
      </div>
      <div class="flex gap-2">
        <UButton size="sm" icon="ArrowPath" @click="$emit('replay')">Replay</UButton>
        <UButton size="sm" icon="XMark" variant="ghost" @click="$emit('close')" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="px-2 pt-2 border-b border-gray-700 bg-gray-800">
      <UTabs :items="tabs" v-model="activeTab" />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto p-4 bg-gray-900">
      
      <!-- HEADERS -->
      <div v-if="activeTab === 'Headers'" class="space-y-6">
        <div>
          <h3 class="font-bold text-xs uppercase text-gray-400 mb-2">General</h3>
          <div class="space-y-1">
            <UKeyValue label="Request URL" :value="request.url" copyable />
            <UKeyValue label="Method" :value="request.method" />
            <UKeyValue label="Status" :value="`${request.status || '...'} ${request.statusText || ''}`" />
            <UKeyValue v-if="request.duration" label="Duration" :value="`${request.duration.toFixed(0)} ms`" />
          </div>
        </div>

        <div v-if="responseHeaders.length > 0">
          <h3 class="font-bold text-xs uppercase text-gray-400 mb-2">Response Headers</h3>
          <div class="space-y-1">
            <UKeyValue v-for="[k, v] in responseHeaders" :key="k" :label="k" :value="v" copyable />
          </div>
        </div>

        <div v-if="requestHeaders.length > 0">
          <h3 class="font-bold text-xs uppercase text-gray-400 mb-2">Request Headers</h3>
          <div class="space-y-1">
            <UKeyValue v-for="[k, v] in requestHeaders" :key="k" :label="k" :value="v" copyable />
          </div>
        </div>
      </div>

      <!-- PAYLOAD -->
      <div v-if="activeTab === 'Payload'">
        <div v-if="hasBody">
          <UJsonTree v-if="isJson(request.requestBody)" :data="request.requestBody" />
          <UCodeBlock v-else language="text">
            {{ String(request.requestBody) }}
          </UCodeBlock>
        </div>
        <div v-else class="text-gray-400 text-sm italic">No request payload</div>
      </div>

      <!-- RESPONSE -->
      <div v-if="activeTab === 'Response'">
        <div v-if="request.responseBody !== undefined">
          <UJsonTree v-if="isJson(request.responseBody)" :data="request.responseBody" />
          <UCodeBlock v-else language="text">
            {{ String(request.responseBody) }}
          </UCodeBlock>
        </div>
        <div v-else-if="request.status === 0" class="text-gray-400 text-sm italic">Pending...</div>
        <div v-else class="text-gray-400 text-sm italic">No response data available</div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

