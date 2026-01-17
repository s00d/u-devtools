<script setup lang="ts">
import { ref, computed } from 'vue';
import { UButton, UBadge, ULoading, UEmpty, UIcon } from '@u-devtools/ui';
import { useApi } from '../context';
import type { SecurityIssue } from '../types';
import IssueCard from './IssueCard.vue';

const api = useApi();

const issues = ref<SecurityIssue[]>([]);
const scanning = ref(false);
const auditData = ref<any>(null);
const filter = ref<string>('all');

const severityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const sortedIssues = computed(() => {
  let filtered = issues.value;

  // Filter by category
  if (filter.value !== 'all') {
    filtered = filtered.filter((issue) => issue.category === filter.value);
  }

  return filtered.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
});

const categories = [
  { value: 'all', label: 'All', icon: 'Squares2X2' },
  { value: 'env', label: 'Environment', icon: 'Key' },
  { value: 'html', label: 'HTML/State', icon: 'DocumentText' },
  { value: 'dom', label: 'DOM', icon: 'GlobeAlt' },
  { value: 'files', label: 'Files', icon: 'Folder' },
  { value: 'scripts', label: 'Scripts', icon: 'CodeBracket' },
  { value: 'headers', label: 'Headers', icon: 'ShieldCheck' },
  { value: 'storage', label: 'Storage', icon: 'CircleStack' },
  { value: 'mixed-content', label: 'Mixed Content', icon: 'ExclamationTriangle' },
  { value: 'server-response', label: 'Server Response', icon: 'Server' },
];

const issuesCount = computed(() => {
  return {
    critical: issues.value.filter((i) => i.severity === 'critical').length,
    high: issues.value.filter((i) => i.severity === 'high').length,
    medium: issues.value.filter((i) => i.severity === 'medium').length,
    low: issues.value.filter((i) => i.severity === 'low').length,
  };
});

const startAudit = async () => {
  scanning.value = true;
  issues.value = [];
  auditData.value = null;

  try {
    // 1. Start browser scanning (via BroadcastChannel)
    const appChannel = new BroadcastChannel('u-devtools:security');
    appChannel.postMessage({ event: 'start-scan' });

    // Listen for response from App
    const handler = async (e: MessageEvent) => {
      if (e.data?.event === 'scan-results') {
        issues.value = [...issues.value, ...e.data.data];

        // GOT URL FROM APP, NOW SCAN SERVER
        const targetUrl = e.data.url || window.location.href;
        if (targetUrl) {
          try {
            const serverRes = await api.rpc.call<{
              success: boolean;
              issues?: SecurityIssue[];
              error?: string;
            }>('security:scan-server-route', targetUrl);

            if (serverRes.success && serverRes.issues) {
              issues.value = [...issues.value, ...serverRes.issues];
              console.log(
                '[U-DevTools:Security] Server scan found',
                serverRes.issues.length,
                'issues'
              );
            } else if (!serverRes.success) {
              console.warn('[U-DevTools:Security] Server scan failed:', serverRes.error);
              // Don't show error to user, as this may be normal
              // (e.g., self-signed certificate or CORS)
            }
          } catch (serverError) {
            console.error('[U-DevTools:Security] Server scan error:', serverError);
            // Silent error - not critical if server scan failed
          }
        }

        appChannel.removeEventListener('message', handler);
        appChannel.close();
      }
    };
    appChannel.addEventListener('message', handler);

    // 2. Start server audit (NPM Audit)
    const auditRes = await api.rpc.call<{
      success: boolean;
      raw: any;
      error?: string;
    }>('security:run-audit');

    if (auditRes.success) {
      auditData.value = auditRes.raw;
      processAuditResults(auditRes.raw);
    } else {
      api.notify(`Audit failed: ${auditRes.error}`, 'error');
    }
  } catch (e) {
    console.error('[U-DevTools:Security] Scan error:', e);
    api.notify('Scan failed', 'error');
  } finally {
    // Small delay for UX
    setTimeout(() => {
      scanning.value = false;
    }, 500);
  }
};

function processAuditResults(raw: any) {
  // Parse NPM Audit JSON (structure depends on NPM version)
  // Example for NPM 7+
  if (raw.vulnerabilities) {
    for (const [pkgName, vuln] of Object.entries(raw.vulnerabilities) as [string, any][]) {
      // vuln can be array or object
      const severity = vuln.severity || 'low';
      if (severity === 'info') continue;

      issues.value.push({
        id: `npm-${pkgName}`,
        category: 'dependencies',
        severity: severity as any,
        title: `Vulnerable Package: ${pkgName}`,
        description: `Depends on vulnerable versions. ${
          vuln.via && vuln.via[0] ? vuln.via[0].title : ''
        }`,
        recommendation: 'Run "npm audit fix" or update the dependency.',
        location: 'package.json',
      });
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900 text-gray-200">
    <!-- Toolbar -->
    <div class="border-b border-gray-800 bg-gray-800">
      <div class="p-3 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <UIcon name="ShieldCheck" class="w-5 h-5" />
            Security Auditor
          </h2>
        </div>
        <div class="flex items-center gap-2">
          <UButton variant="primary" size="sm" icon="Play" :loading="scanning" @click="startAudit">
            Run Scan
          </UButton>
        </div>
      </div>
    </div>

    <!-- Category Filters -->
    <div
      class="p-2 border-b border-gray-800 bg-gray-800/50 flex gap-2 overflow-x-auto"
    >
      <button
        v-for="cat in categories"
        :key="cat.value"
        @click="filter = cat.value"
        class="px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap flex items-center gap-1.5"
        :class="
          filter === cat.value
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        "
      >
        <UIcon :name="cat.icon" class="w-3.5 h-3.5" />
        {{ cat.label }}
        <span
          v-if="cat.value === 'all'"
          class="ml-1 px-1.5 py-0.5 rounded bg-gray-800 text-[10px]"
        >
          {{ issues.length }}
        </span>
        <span
          v-else
          class="ml-1 px-1.5 py-0.5 rounded bg-gray-800 text-[10px]"
        >
          {{ issues.filter((i) => i.category === cat.value).length }}
        </span>
      </button>
    </div>

    <!-- Summary Stats -->
    <div
      class="grid grid-cols-4 gap-4 p-4 border-b border-gray-800 bg-gray-800/50"
    >
      <div
        class="flex flex-col items-center p-3 rounded bg-red-900/20 border border-red-900/50"
      >
        <span class="text-2xl font-bold text-red-500">{{ issuesCount.critical }}</span>
        <span class="text-xs text-red-300 uppercase font-bold">Critical</span>
      </div>
      <div
        class="flex flex-col items-center p-3 rounded bg-orange-900/20 border border-orange-900/50"
      >
        <span class="text-2xl font-bold text-orange-500">{{ issuesCount.high }}</span>
        <span class="text-xs text-orange-300 uppercase font-bold">High</span>
      </div>
      <div
        class="flex flex-col items-center p-3 rounded bg-yellow-900/20 border border-yellow-900/50"
      >
        <span class="text-2xl font-bold text-yellow-500">{{ issuesCount.medium }}</span>
        <span class="text-xs text-yellow-300 uppercase font-bold">Medium</span>
      </div>
      <div
        class="flex flex-col items-center p-3 rounded bg-blue-900/20 border border-blue-900/50"
      >
        <span class="text-2xl font-bold text-blue-500">{{ issuesCount.low }}</span>
        <span class="text-xs text-blue-300 uppercase font-bold">Low</span>
      </div>
    </div>

    <!-- Issues List -->
    <div class="flex-1 overflow-auto p-4 space-y-3">
      <template v-if="sortedIssues.length > 0">
        <IssueCard v-for="issue in sortedIssues" :key="issue.id" :issue="issue" />
      </template>

      <div
        v-else-if="!scanning && auditData"
        class="flex flex-col items-center justify-center py-12 text-green-500"
      >
        <UIcon name="CheckBadge" class="w-16 h-16 mb-4" />
        <h3 class="text-xl font-bold">No Issues Found</h3>
        <p class="text-gray-400">Your application looks secure based on our checks.</p>
      </div>

      <UEmpty
        v-else-if="!scanning"
        title="Ready to Scan"
        description="Click 'Run Scan' to check for vulnerabilities"
        icon="ShieldExclamation"
      />

      <div v-else class="py-12 flex justify-center">
        <ULoading size="lg" text="Scanning application..." />
      </div>
    </div>
  </div>
</template>

