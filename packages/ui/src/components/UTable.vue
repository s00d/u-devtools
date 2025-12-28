<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; width?: string }[];
  rows: unknown[];
}>();
</script>

<template>
  <div class="w-full overflow-auto border border-gray-200 rounded">
    <table class="w-full text-left text-sm whitespace-nowrap">
      <thead class="bg-gray-50 border-b border-gray-200 font-semibold text-gray-600">
        <tr>
          <th v-for="col in columns" :key="col.key" class="px-4 py-2" :style="{ width: col.width }">
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <tr v-for="(row, idx) in rows" :key="idx" class="hover:bg-gray-50 transition-colors">
          <td v-for="col in columns" :key="col.key" class="px-4 py-2">
            <slot :name="`cell-${col.key}`" :row="row" :val="(row as Record<string, unknown>)[col.key]">
              {{ (row as Record<string, unknown>)[col.key] }}
            </slot>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-8 text-center text-gray-400">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

