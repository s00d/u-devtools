<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[];
  rows: unknown[];
}>();
</script>

<template>
  <div class="w-full overflow-auto border border-gray-700 rounded">
    <table class="w-full text-left text-sm table-fixed">
      <colgroup>
        <col v-for="col in columns" :key="col.key" :style="{ width: col.width || 'auto' }" />
      </colgroup>
      <thead class="bg-gray-800 border-b border-gray-700 font-semibold text-gray-200">
        <tr>
          <th v-for="col in columns" :key="col.key" class="px-4 py-2">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-700 bg-gray-900">
        <tr v-for="(row, idx) in rows" :key="idx" class="hover:bg-gray-800 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-4 py-2 text-gray-100 overflow-hidden">
            <slot :name="`cell-${col.key}`" :row="row" :val="(row as Record<string, unknown>)[col.key]">
              <div class="truncate">
                {{ (row as Record<string, unknown>)[col.key] }}
              </div>
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-500">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

