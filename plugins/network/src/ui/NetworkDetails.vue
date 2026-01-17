<script setup lang="ts">
import { ref, computed } from 'vue';
import { UTabs, UJsonTree, UKeyValue, UButton, UCodeBlock, UIcon, UBadge } from '@u-devtools/ui';
import { useApi } from '../context';
import { generateCurlCommand } from '../utils/curl';

const props = defineProps<{
  request: {
    id: string;
    url: string;
    method: string;
    type?: 'fetch' | 'xhr' | 'websocket' | 'eventsource' | 'beacon' | 'webtransport' | 'resource';
    subType?: 'http' | 'graphql' | 'grpc' | 'json-rpc' | 'unknown';
    status?: number;
    statusText?: string;
    requestHeaders?: Record<string, string>;
    requestBody?: unknown;
    responseHeaders?: Record<string, string>;
    responseBody?: unknown;
    duration?: number;
    frames?: Array<{ id: string; time: number; type: 'send' | 'received'; data: string }>;
  };
}>();

const api = useApi();

const emit = defineEmits<{
  close: [];
  replay: [];
  'load-to-composer': [request: typeof props.request];
}>();

const activeTab = ref('Headers');

const isStream = computed(() => 
  props.request.type === 'websocket' || 
  props.request.type === 'eventsource' || 
  props.request.type === 'webtransport'
);

const tabs = computed(() => {
  const base = ['Headers'];
  if (isStream.value) {
    base.push('Messages');
  } else {
    base.push('Payload', 'Response');
  }
  return base;
});

const messages = computed(() => props.request.frames || []);

const requestHeaders = computed(() => Object.entries(props.request.requestHeaders || {}));
const responseHeaders = computed(() => Object.entries(props.request.responseHeaders || {}));
const hasBody = computed(() => !!props.request.requestBody);

const isJson = (data: unknown) =>
  (typeof data === 'object' && data !== null && !Array.isArray(data)) || Array.isArray(data);

// Function to extract host from URL
const getHost = (url: string): string => {
  try {
    // If URL starts with protocol, use URL API
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      return urlObj.origin;
    }

    // If URL is relative (starts with /), return current origin
    if (url.startsWith('/')) {
      return window.location.origin;
    }

    // If URL contains :// but without http/https, still try to parse
    if (url.includes('://')) {
      const urlObj = new URL(url);
      return urlObj.origin;
    }

    // For relative paths return current origin
    return window.location.origin;
  } catch {
    // If parsing failed, return current origin
    return window.location.origin;
  }
};

const getTypeColor = (type: string): 'gray' | 'yellow' | 'blue' | 'red' | 'green' | undefined => {
  switch(type) {
    case 'websocket': return 'blue';
    case 'webtransport': return 'green';
    case 'eventsource': return 'yellow';
    case 'resource': return 'gray';
    case 'beacon': return 'yellow';
    default: return 'blue';
  }
};

const copyAsCurl = async () => {
  if (!api.clipboard) {
    console.error('Clipboard API not available');
    return;
  }

  try {
    const curlCommand = generateCurlCommand({
      url: props.request.url,
      method: props.request.method,
      requestHeaders: props.request.requestHeaders,
      requestBody: props.request.requestBody,
    });

    await api.clipboard.copy(curlCommand, 'cURL command copied to clipboard');
  } catch (error) {
    console.error('Failed to copy cURL command:', error);
    api.notify('Failed to copy cURL command', 'error');
  }
};
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200 border-l border-gray-700">
    <!-- Header -->
    <div class="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <UBadge 
            size="xs" 
            :color="getTypeColor(request.type || 'fetch')"
          >
            {{ (request.type || 'fetch').toUpperCase() }}
          </UBadge>
          <span v-if="request.subType && request.subType !== 'http'" class="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
            {{ request.subType }}
          </span>
          <span v-if="request.status" class="text-xs" :class="request.status === 101 ? 'text-green-400' : 'text-gray-400'">
            {{ request.statusText || request.status }}
          </span>
        </div>
        <div class="font-bold text-sm truncate text-white" :title="request.url">
          {{ request.url.split('/').pop() || request.url }}
        </div>
        <div class="text-xs text-gray-400 truncate mt-1" :title="getHost(request.url)">
          {{ getHost(request.url) }}
        </div>
      </div>
      <div class="flex gap-2">
        <UButton size="sm" icon="ArrowPath" @click="$emit('replay')">Replay</UButton>
        <UButton
          size="sm"
          icon="ArrowRightCircle"
          @click="$emit('load-to-composer', request)"
          title="Load into Composer"
        >
          Composer
        </UButton>
        <UButton size="sm" icon="Clipboard" @click="copyAsCurl" title="Copy as cURL">
          cURL
        </UButton>
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
            <UKeyValue label="Host" :value="getHost(request.url)" copyable />
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

      <!-- MESSAGES TAB (For WS/SSE/WebTransport) -->
      <div v-if="activeTab === 'Messages'" class="space-y-0">
        <div v-if="messages.length === 0" class="text-gray-500 italic text-center py-4">No messages yet</div>
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="flex gap-3 py-2 border-b border-gray-800 text-sm font-mono hover:bg-gray-800/50 p-2 rounded"
        >
          <div class="flex flex-col items-center gap-1 w-16 shrink-0">
            <UIcon 
              :name="msg.type === 'send' ? 'ArrowUp' : 'ArrowDown'" 
              :class="msg.type === 'send' ? 'text-green-400' : 'text-blue-400'"
              class="w-4 h-4" 
            />
            <span class="text-[10px] text-gray-600">
              {{ new Date(msg.time).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'}) }}.{{ String(msg.time % 1000).padStart(3, '0') }}
            </span>
          </div>
          <div class="flex-1 overflow-hidden break-all text-gray-300">
            {{ typeof msg.data === 'string' ? msg.data : '[Binary Data]' }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

