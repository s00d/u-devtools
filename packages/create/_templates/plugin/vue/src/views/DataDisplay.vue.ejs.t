---
to: <%= projectName %>/src/views/DataDisplay.vue
---
<script setup lang="ts">
import { ref } from 'vue';
import { UCard, UTable } from '@u-devtools/ui';

const items = ref([
  { id: 1, name: 'Item 1', status: 'Active' },
  { id: 2, name: 'Item 2', status: 'Inactive' },
  { id: 3, name: 'Item 3', status: 'Active' },
]);

const columns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status', width: '120px' },
];
</script>

<template>
  <div class="space-y-6">
    <UCard title="Data Display">
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold mb-2">Table</h3>
          <UTable :columns="columns" :rows="items" />
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">List</h3>
          <div class="space-y-2">
            <div
              v-for="item in items"
              :key="item.id"
              class="p-3 bg-gray-800 rounded border border-gray-700"
            >
              <div class="flex justify-between">
                <span class="font-medium">{{ item.name }}</span>
                <span class="text-sm text-gray-400">{{ item.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

