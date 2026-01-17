<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { UButton, UInput, USelect, UBadge, UIcon, UModal } from '@u-devtools/ui';
import { useBridge, useApi } from '../../context';

const bridge = useBridge();
const api = useApi();

// Types for saved requests
interface SavedRequest {
  id: string;
  name: string;
  method: string;
  url: string;
  authType: string;
  authValue: string;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  bodyType: string;
  headers: Array<{ key: string; value: string; enabled: boolean }>;
  body: string;
}

// Form state
const method = ref('GET');
const url = ref('');
const authType = ref('none'); // none, bearer, basic, custom
const authValue = ref('');
const queryParams = ref<Array<{ key: string; value: string; enabled: boolean }>>([]);
const bodyType = ref('json'); // json, form-data, raw, text
const headers = ref<Array<{ key: string; value: string; enabled: boolean }>>([
  { key: 'Content-Type', value: 'application/json', enabled: true },
]);
const body = ref('');
const isSending = ref(false);
const response = ref<{
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  error?: string;
} | null>(null);

// Saved requests
const savedRequests = ref<SavedRequest[]>([]);
const showSavedRequests = ref(false);
const requestName = ref('');

// Load saved requests
onMounted(() => {
  const saved = api.storage.get<SavedRequest[]>('saved-requests', []);
  if (saved) {
    savedRequests.value = saved;
  }
});

// Save requests
const saveRequests = () => {
  api.storage.set('saved-requests', savedRequests.value);
};

// Add query parameter
const addQueryParam = () => {
  queryParams.value.push({ key: '', value: '', enabled: true });
};

// Remove query parameter
const removeQueryParam = (index: number) => {
  queryParams.value.splice(index, 1);
};

// Add header
const addHeader = () => {
  headers.value.push({ key: '', value: '', enabled: true });
};

// Remove header
const removeHeader = (index: number) => {
  headers.value.splice(index, 1);
};

// Update Content-Type when body type changes
const updateContentType = () => {
  const contentTypeMap: Record<string, string> = {
    json: 'application/json',
    'form-data': 'multipart/form-data',
    raw: 'text/plain',
    text: 'text/plain',
  };

  const contentType = contentTypeMap[bodyType.value] || 'application/json';
  const existingContentType = headers.value.find((h) => h.key.toLowerCase() === 'content-type');

  if (existingContentType) {
    existingContentType.value = contentType;
  } else {
    headers.value.push({ key: 'Content-Type', value: contentType, enabled: true });
  }
};

// Body validation
const isValidBody = computed(() => {
  if (!body.value.trim() || method.value === 'GET' || method.value === 'HEAD') {
    return true;
  }

  if (bodyType.value === 'json') {
    try {
      JSON.parse(body.value);
      return true;
    } catch {
      return false;
    }
  }

  return true;
});

// Placeholder for body
const bodyPlaceholder = computed(() => {
  if (bodyType.value === 'json') {
    return '{\n  "key": "value"\n}';
  } else if (bodyType.value === 'form-data') {
    return '{\n  "field1": "value1",\n  "field2": "value2"\n}';
  }
  return 'Enter request body';
});

// Build URL with query parameters
const buildUrl = (): string => {
  const finalUrl = url.value.trim();
  const enabledParams = queryParams.value.filter((p) => p.enabled && p.key.trim());

  if (enabledParams.length > 0) {
    try {
      // Try to use URL API if URL is full
      if (finalUrl.includes('://')) {
        const urlObj = new URL(finalUrl);
        enabledParams.forEach((param) => {
          urlObj.searchParams.set(param.key.trim(), param.value);
        });
        return urlObj.toString();
      } else {
        // If URL is relative, add parameters manually
        const separator = finalUrl.includes('?') ? '&' : '?';
        const params = enabledParams
          .map(
            (param) => `${encodeURIComponent(param.key.trim())}=${encodeURIComponent(param.value)}`
          )
          .join('&');
        return `${finalUrl}${separator}${params}`;
      }
    } catch {
      // If parsing failed, add parameters manually
      const separator = finalUrl.includes('?') ? '&' : '?';
      const params = enabledParams
        .map(
          (param) => `${encodeURIComponent(param.key.trim())}=${encodeURIComponent(param.value)}`
        )
        .join('&');
      return `${finalUrl}${separator}${params}`;
    }
  }

  return finalUrl;
};

// Fill form from existing request
const loadRequest = (request: {
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
}) => {
  method.value = request.method || 'GET';
  url.value = request.url || '';

  // Parse query parameters from URL
  try {
    if (request.url.includes('://')) {
      const urlObj = new URL(request.url);
      queryParams.value = Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({
        key,
        value,
        enabled: true,
      }));
      url.value = urlObj.origin + urlObj.pathname;
    } else {
      // Relative URL
      const [path, query] = request.url.split('?');
      url.value = path;
      if (query) {
        queryParams.value = query.split('&').map((param) => {
          const [key, value = ''] = param.split('=');
          return {
            key: decodeURIComponent(key),
            value: decodeURIComponent(value),
            enabled: true,
          };
        });
      } else {
        queryParams.value = [];
      }
    }
  } catch {
    queryParams.value = [];
  }

  // Load headers
  if (request.requestHeaders) {
    headers.value = Object.entries(request.requestHeaders).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));

    // Determine authorization type
    const authHeader = Object.entries(request.requestHeaders).find(
      ([key]) => key.toLowerCase() === 'authorization'
    );
    if (authHeader) {
      const [_, authValueStr] = authHeader;
      if (authValueStr.startsWith('Bearer ')) {
        authType.value = 'bearer';
        authValue.value = authValueStr.replace('Bearer ', '');
      } else if (authValueStr.startsWith('Basic ')) {
        authType.value = 'basic';
        authValue.value = authValueStr.replace('Basic ', '');
      } else {
        authType.value = 'custom';
        authValue.value = authValueStr;
      }
    }
  } else {
    headers.value = [{ key: 'Content-Type', value: 'application/json', enabled: true }];
    authType.value = 'none';
    authValue.value = '';
  }

  // Load body
  if (request.requestBody) {
    if (typeof request.requestBody === 'string') {
      body.value = request.requestBody;
      bodyType.value = 'raw';
    } else {
      body.value = JSON.stringify(request.requestBody, null, 2);
      bodyType.value = 'json';
    }
  } else {
    body.value = '';
    bodyType.value = 'json';
  }

  response.value = null;
};

// Load saved request
const loadSavedRequest = (saved: SavedRequest) => {
  method.value = saved.method;
  url.value = saved.url;
  authType.value = saved.authType;
  authValue.value = saved.authValue;
  queryParams.value = saved.queryParams;
  bodyType.value = saved.bodyType;
  headers.value = saved.headers;
  body.value = saved.body;
  response.value = null;
  showSavedRequests.value = false;
  updateContentType();
};

// Save current request
const saveCurrentRequest = () => {
  if (!requestName.value.trim()) {
    api.notify('Request name is required', 'error');
    return;
  }

  const saved: SavedRequest = {
    id: Math.random().toString(36).slice(2),
    name: requestName.value.trim(),
    method: method.value,
    url: url.value,
    authType: authType.value,
    authValue: authValue.value,
    queryParams: queryParams.value,
    bodyType: bodyType.value,
    headers: headers.value,
    body: body.value,
  };

  savedRequests.value.push(saved);
  saveRequests();
  requestName.value = '';
  api.notify('Request saved', 'success');
};

// Delete saved request
const deleteSavedRequest = (id: string) => {
  savedRequests.value = savedRequests.value.filter((r) => r.id !== id);
  saveRequests();
  api.notify('Request deleted', 'success');
};

// Send request
const sendRequest = async () => {
  const finalUrl = buildUrl();

  if (!finalUrl.trim()) {
    api.notify('URL is required', 'error');
    return;
  }

  if (!isValidBody.value) {
    api.notify('Invalid body format', 'error');
    return;
  }

  isSending.value = true;
  response.value = null;

  try {
    // Form headers
    const requestHeaders: Record<string, string> = {};

    // Add authorization
    if (authType.value !== 'none' && authValue.value.trim()) {
      if (authType.value === 'bearer') {
        requestHeaders['Authorization'] = `Bearer ${authValue.value.trim()}`;
      } else if (authType.value === 'basic') {
        requestHeaders['Authorization'] = `Basic ${authValue.value.trim()}`;
      } else if (authType.value === 'custom') {
        requestHeaders['Authorization'] = authValue.value.trim();
      }
    }

    // Add remaining headers
    headers.value
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        requestHeaders[h.key.trim()] = h.value;
      });

    // Form request options
    const options: RequestInit = {
      method: method.value,
      headers: requestHeaders,
    };

    // Add body for methods that support it
    if (method.value !== 'GET' && method.value !== 'HEAD' && body.value.trim()) {
      if (bodyType.value === 'form-data') {
        // FormData needs separate handling
        const formData = new FormData();
        try {
          const jsonData = JSON.parse(body.value);
          Object.entries(jsonData).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          options.body = formData;
          // Remove Content-Type for FormData, browser will set it automatically
          delete requestHeaders['Content-Type'];
        } catch {
          api.notify('Invalid JSON for form-data', 'error');
          return;
        }
      } else {
        options.body = body.value.trim();
      }
    }

    // Send request
    const startTime = Date.now();
    const fetchResponse = await fetch(finalUrl, options);
    const duration = Date.now() - startTime;

    // Read response
    let responseBody: unknown;
    const contentType = fetchResponse.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        responseBody = await fetchResponse.json();
      } catch {
        responseBody = await fetchResponse.text();
      }
    } else {
      responseBody = await fetchResponse.text();
    }

    // Parse response headers
    const responseHeadersObj: Record<string, string> = {};
    fetchResponse.headers.forEach((value, key) => {
      responseHeadersObj[key] = value;
    });

    response.value = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: responseHeadersObj,
      body: responseBody,
    };

    api.notify(`Request completed in ${duration}ms`, 'success');
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Network Error';
    response.value = {
      error: errorMessage,
    };
    api.notify(`Request failed: ${errorMessage}`, 'error');
  } finally {
    isSending.value = false;
  }
};

// Clear form
const clear = () => {
  method.value = 'GET';
  url.value = '';
  authType.value = 'none';
  authValue.value = '';
  queryParams.value = [];
  bodyType.value = 'json';
  headers.value = [{ key: 'Content-Type', value: 'application/json', enabled: true }];
  body.value = '';
  response.value = null;
};

// Export methods for parent
defineExpose({
  loadRequest,
  clear,
});
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Header -->
    <div class="p-4 border-b border-gray-700 bg-gray-800 flex justify-between items-center">
      <h3 class="text-sm font-bold text-gray-300">Request Composer</h3>
      <div class="flex gap-2">
        <UButton
          variant="ghost"
          size="sm"
          icon="Bookmark"
          @click="showSavedRequests = true"
        >
          Saved ({{ savedRequests.length }})
        </UButton>
        <UButton variant="ghost" size="sm" icon="XMark" @click="clear">Clear</UButton>
        <UButton
          variant="primary"
          size="sm"
          icon="PaperAirplane"
          :loading="isSending"
          :disabled="!url.trim() || !isValidBody"
          @click="sendRequest"
        >
          Send Request
        </UButton>
      </div>
    </div>

    <!-- Form -->
    <div class="flex-1 overflow-auto p-4 space-y-4">
      <!-- Method and URL -->
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-2">
          <USelect
            v-model="method"
            :options="[
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'PATCH', value: 'PATCH' },
              { label: 'DELETE', value: 'DELETE' },
              { label: 'HEAD', value: 'HEAD' },
              { label: 'OPTIONS', value: 'OPTIONS' },
            ]"
          />
        </div>
        <div class="col-span-10">
          <UInput v-model="url" placeholder="https://api.example.com/users" />
        </div>
      </div>

      <!-- Authorization -->
      <div class="border border-gray-700 rounded-lg p-3 bg-gray-800/50">
        <label class="text-xs text-gray-400 font-medium block mb-2">Authorization</label>
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-3">
            <USelect
              v-model="authType"
              :options="[
                { label: 'None', value: 'none' },
                { label: 'Bearer Token', value: 'bearer' },
                { label: 'Basic Auth', value: 'basic' },
                { label: 'Custom', value: 'custom' },
              ]"
            />
          </div>
          <div class="col-span-9">
            <UInput
              v-model="authValue"
              :placeholder="
                authType === 'bearer'
                  ? 'Enter token'
                  : authType === 'basic'
                    ? 'username:password or base64'
                    : authType === 'custom'
                      ? 'Custom authorization header'
                      : ''
              "
              :disabled="authType === 'none'"
            />
          </div>
        </div>
      </div>

      <!-- Query Parameters -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs text-gray-400 font-medium">Query Parameters</label>
          <UButton variant="ghost" size="xs" icon="Plus" @click="addQueryParam">
            Add Parameter
          </UButton>
        </div>
        <div class="space-y-2">
          <div
            v-for="(param, index) in queryParams"
            :key="index"
            class="grid grid-cols-12 gap-2 items-center"
          >
            <div class="col-span-1">
              <input
                type="checkbox"
                v-model="param.enabled"
                class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-4">
              <UInput
                v-model="param.key"
                placeholder="Parameter name"
                size="sm"
                :disabled="!param.enabled"
              />
            </div>
            <div class="col-span-6">
              <UInput
                v-model="param.value"
                placeholder="Parameter value"
                size="sm"
                :disabled="!param.enabled"
              />
            </div>
            <div class="col-span-1">
              <UButton
                variant="ghost"
                size="xs"
                icon="Trash"
                class="text-red-400 hover:text-red-500"
                @click="removeQueryParam(index)"
              />
            </div>
          </div>
          <div v-if="queryParams.length === 0" class="text-xs text-gray-500 italic">
            No query parameters
          </div>
        </div>
      </div>

      <!-- Headers -->
      <div>
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs text-gray-400 font-medium">Headers</label>
          <UButton variant="ghost" size="xs" icon="Plus" @click="addHeader">
            Add Header
          </UButton>
        </div>
        <div class="space-y-2">
          <div
            v-for="(header, index) in headers"
            :key="index"
            class="grid grid-cols-12 gap-2 items-center"
          >
            <div class="col-span-1">
              <input
                type="checkbox"
                v-model="header.enabled"
                class="w-4 h-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div class="col-span-4">
              <UInput
                v-model="header.key"
                placeholder="Header name"
                size="sm"
                :disabled="!header.enabled"
              />
            </div>
            <div class="col-span-6">
              <UInput
                v-model="header.value"
                placeholder="Header value"
                size="sm"
                :disabled="!header.enabled"
              />
            </div>
            <div class="col-span-1">
              <UButton
                variant="ghost"
                size="xs"
                icon="Trash"
                class="text-red-400 hover:text-red-500"
                @click="removeHeader(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div v-if="method !== 'GET' && method !== 'HEAD'">
        <div class="flex justify-between items-center mb-2">
          <label class="text-xs text-gray-400 font-medium">Request Body</label>
          <div class="flex gap-2">
            <USelect
              v-model="bodyType"
              :options="[
                { label: 'JSON', value: 'json' },
                { label: 'Form Data', value: 'form-data' },
                { label: 'Raw', value: 'raw' },
                { label: 'Text', value: 'text' },
              ]"
              size="sm"
              @update:model-value="updateContentType"
            />
            <UButton
              variant="ghost"
              size="xs"
              icon="Bookmark"
              @click="
                requestName = `${method} ${url}`;
                saveCurrentRequest();
              "
            >
              Save
            </UButton>
          </div>
        </div>
        <textarea
          v-model="body"
          class="w-full h-48 bg-gray-800 text-gray-200 font-mono text-sm p-3 rounded border border-gray-700 focus:border-indigo-500 outline-none resize-none"
          :class="{ 'border-red-500': !isValidBody && body.trim() }"
          :placeholder="bodyPlaceholder"
        ></textarea>
        <div v-if="!isValidBody && body.trim()" class="text-red-400 text-xs mt-1">
          Invalid {{ bodyType === 'json' ? 'JSON' : 'format' }}
        </div>
      </div>

      <!-- Response -->
      <div v-if="response" class="border-t border-gray-700 pt-4">
        <div class="flex items-center gap-2 mb-3">
          <h4 class="text-sm font-bold text-gray-300">Response</h4>
          <UBadge
            v-if="response.status"
            :color="
              response.status >= 200 && response.status < 300
                ? 'green'
                : response.status >= 400
                  ? 'red'
                  : 'yellow'
            "
            size="xs"
          >
            {{ response.status }} {{ response.statusText }}
          </UBadge>
          <UBadge v-if="response.error" color="red" size="xs">Error</UBadge>
        </div>

        <!-- Response Headers -->
        <div v-if="response.headers" class="mb-4">
          <label class="text-xs text-gray-400 font-medium block mb-2">Response Headers</label>
          <div class="bg-gray-800 rounded p-2 space-y-1 max-h-32 overflow-auto">
            <div
              v-for="(value, key) in response.headers"
              :key="key"
              class="text-xs font-mono text-gray-300"
            >
              <span class="text-gray-500">{{ key }}:</span> {{ value }}
            </div>
          </div>
        </div>

        <!-- Response Body -->
        <div>
          <label class="text-xs text-gray-400 font-medium block mb-2">Response Body</label>
          <pre
            class="bg-gray-800 rounded p-3 text-xs font-mono text-gray-300 overflow-auto max-h-64"
          >{{ typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body || response.error }}</pre>
        </div>
      </div>
    </div>

    <!-- Saved Requests Modal -->
    <UModal :visible="showSavedRequests" title="Saved Requests" @close="showSavedRequests = false">
      <div class="p-4 space-y-3 max-h-96 overflow-auto">
        <div
          v-for="saved in savedRequests"
          :key="saved.id"
          class="flex items-center justify-between p-3 border border-gray-700 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <UBadge
                :color="
                  saved.method === 'GET'
                    ? 'blue'
                    : saved.method === 'POST'
                      ? 'green'
                      : 'gray'
                "
                size="xs"
              >
                {{ saved.method }}
              </UBadge>
              <span class="font-medium text-gray-200 truncate">{{ saved.name }}</span>
            </div>
            <div class="text-xs text-gray-500 truncate">{{ saved.url }}</div>
          </div>
          <div class="flex gap-2">
            <UButton
              variant="ghost"
              size="xs"
              icon="ArrowRightCircle"
              @click="loadSavedRequest(saved)"
            >
              Load
            </UButton>
            <UButton
              variant="ghost"
              size="xs"
              icon="Trash"
              class="text-red-400 hover:text-red-500"
              @click="deleteSavedRequest(saved.id)"
            />
          </div>
        </div>
        <div v-if="savedRequests.length === 0" class="text-center text-gray-500 text-sm py-8">
          No saved requests
        </div>
      </div>
    </UModal>
  </div>
</template>
