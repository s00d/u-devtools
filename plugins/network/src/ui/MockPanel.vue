<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { UButton, UEmpty, UBadge, UIcon } from '@u-devtools/ui';
import { useBridge, useApi } from '../context';
import MockRuleModal from './components/MockRuleModal.vue';
import type { MockRule } from '../types';

const bridge = useBridge();
const api = useApi();

const rules = ref<MockRule[]>([]);
const isModalOpen = ref(false);
const editingRule = ref<MockRule | undefined>(undefined);


// Function to serialize rules before sending
const serializeRules = (rulesArray: MockRule[]): MockRule[] => {
  // Use JSON for deep serialization to remove Vue proxies
  return JSON.parse(JSON.stringify(rulesArray));
};

// Load from storage
onMounted(() => {
  const saved = api.storage.get<MockRule[]>('mock-rules', []);
  if (saved) {
    rules.value = saved;
    // Send rules to App Context on load (serialize)
    bridge.send('update-mock-rules', serializeRules(rules.value));
  }
});

// Save and send to App
watch(
  rules,
  (newRules) => {
    api.storage.set('mock-rules', newRules);
    // Send to App Context via bridge (serialize)
    bridge.send('update-mock-rules', serializeRules(newRules));
  },
  { deep: true }
);

const openCreate = () => {
  editingRule.value = undefined;
  isModalOpen.value = true;
};

const openEdit = (rule: MockRule) => {
  editingRule.value = rule;
  isModalOpen.value = true;
};

const saveRule = (rule: MockRule) => {
  const idx = rules.value.findIndex((r) => r.id === rule.id);
  if (idx !== -1) {
    rules.value[idx] = rule;
  } else {
    rules.value.push(rule);
  }
  isModalOpen.value = false;
};

const deleteRule = (id: string) => {
  rules.value = rules.value.filter((r) => r.id !== id);
};

const toggleRule = (rule: MockRule) => {
  rule.active = !rule.active;
  // Trigger watch to send updates
  rules.value = [...rules.value];
};

// Export rules for parent
defineExpose({ rules });
</script>

<template>
  <div class="h-full flex flex-col bg-gray-900">
    <div
      class="p-4 border-b border-gray-800 flex justify-between items-center"
    >
      <h3 class="text-sm font-bold text-gray-300">API Mocks</h3>
      <UButton size="sm" icon="Plus" @click="openCreate">Add Rule</UButton>
    </div>

    <div class="flex-1 overflow-auto p-4 space-y-3">
      <div
        v-for="rule in rules"
        :key="rule.id"
        class="border border-gray-700 rounded-lg p-3 flex items-center gap-4 bg-gray-800/50 hover:bg-gray-800 transition-colors"
        :class="{ 'opacity-50': !rule.active }"
      >
        <!-- Toggle Switch -->
        <button
          class="w-10 h-5 rounded-full relative transition-colors"
          :class="rule.active ? 'bg-green-600' : 'bg-gray-600'"
          @click="toggleRule(rule)"
        >
          <div
            class="absolute top-1 w-3 h-3 rounded-full bg-white transition-all"
            :class="rule.active ? 'left-6' : 'left-1'"
          />
        </button>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <UBadge
              :color="
                rule.method === 'GET'
                  ? 'blue'
                  : rule.method === 'POST'
                    ? 'green'
                    : 'gray'
              "
              size="xs"
              >{{ rule.method }}</UBadge
            >
            <span class="font-mono text-sm text-gray-200 truncate">{{
              rule.urlMatcher
            }}</span>
          </div>
          <div class="flex gap-3 text-xs text-gray-500">
            <span
              :class="
                rule.responseStatus >= 400 ? 'text-red-400' : 'text-green-400'
              "
            >
              Status: {{ rule.responseStatus }}
            </span>
            <span v-if="rule.responseDelay > 0"
              >Delay: {{ rule.responseDelay }}ms</span
            >
          </div>
        </div>

        <div class="flex gap-1">
          <UButton
            variant="ghost"
            size="xs"
            icon="Pencil"
            @click="openEdit(rule)"
          />
          <UButton
            variant="ghost"
            size="xs"
            icon="Trash"
            class="text-red-400 hover:text-red-500"
            @click="deleteRule(rule.id)"
          />
        </div>
      </div>

      <UEmpty
        v-if="rules.length === 0"
        title="No Mock Rules"
        description="Create a rule to intercept requests"
        icon="Bolt"
      />
    </div>

    <MockRuleModal
      v-if="isModalOpen"
      :visible="isModalOpen"
      :rule="editingRule"
      @close="isModalOpen = false"
      @save="saveRule"
    />
  </div>
</template>

