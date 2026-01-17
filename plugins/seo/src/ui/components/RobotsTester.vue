<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { UInput, UButton, UCodeBlock, USelect, UBadge, UIcon } from '@u-devtools/ui';
import { RobotsParser } from '../../utils/robots';

const props = defineProps<{
  content: string;
  currentPath?: string; // Optional current page path
}>();

const parser = computed(() => new RobotsParser(props.content));

// Automatically fill current path on mount
const testPath = ref(props.currentPath || '/');
const testAgent = ref('*');
const result = ref<{ allowed: boolean; rule?: string } | null>(null);

const activeTab = ref<'tester' | 'raw'>('tester');

const agents = [
  { label: 'Googlebot', value: 'googlebot' },
  { label: 'Googlebot-Image', value: 'googlebot-image' },
  { label: 'Bingbot', value: 'bingbot' },
  { label: 'Yandex', value: 'yandex' },
  { label: 'Twitterbot', value: 'twitterbot' },
  { label: 'Facebook', value: 'facebookexternalhit' },
  { label: 'Any (*)', value: '*' },
];

const check = () => {
  result.value = parser.value.check(testPath.value, testAgent.value);
};

// Auto-check
watch([testPath, testAgent, () => props.content], check, { immediate: true });

// Update path when prop changes
watch(
  () => props.currentPath,
  (newPath) => {
    if (newPath) {
      testPath.value = newPath;
    }
  }
);
</script>

<template>
  <div class="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
    <!-- Header tabs -->
    <div class="flex border-b border-gray-700">
      <button 
        v-for="tab in ['tester', 'raw']" 
        :key="tab"
        class="px-4 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'"
        @click="activeTab = tab as any"
      >
        {{ tab === 'tester' ? 'Rule Tester' : 'Raw File' }}
      </button>
    </div>

    <!-- TESTER VIEW -->
    <div v-if="activeTab === 'tester'" class="p-4 space-y-4">
      <div class="flex gap-4">
        <div class="w-1/3">
          <label class="text-xs text-gray-400 mb-1 block">User Agent</label>
          <USelect v-model="testAgent" :options="agents" />
        </div>
        <div class="flex-1">
          <label class="text-xs text-gray-400 mb-1 block">Path (relative)</label>
          <UInput v-model="testPath" placeholder="/admin" />
        </div>
      </div>

      <div class="p-4 rounded-lg border flex items-center justify-between"
        :class="result?.allowed 
          ? 'bg-green-900/20 border-green-900/50' 
          : 'bg-red-900/20 border-red-900/50'"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-full" :class="result?.allowed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
            <UIcon :name="result?.allowed ? 'Check' : 'XMark'" class="w-6 h-6" />
          </div>
          <div>
            <div class="font-bold text-lg" :class="result?.allowed ? 'text-green-400' : 'text-red-400'">
              {{ result?.allowed ? 'Allowed' : 'Blocked' }}
            </div>
            <div class="text-sm text-gray-400 font-mono">
              Match: {{ result?.rule }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="parser.sitemaps.length > 0" class="mt-4 pt-4 border-t border-gray-700">
        <div class="text-xs text-gray-400 mb-2">Detected Sitemaps:</div>
        <div v-for="sm in parser.sitemaps" :key="sm" class="text-sm font-mono text-blue-400 bg-black/20 p-2 rounded truncate">
          {{ sm }}
        </div>
      </div>
    </div>

    <!-- RAW VIEW -->
    <div v-else>
      <UCodeBlock language="text" :code="content" />
    </div>
  </div>
</template>

