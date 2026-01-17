<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';
import type { ComponentMeta } from '../../types';

defineProps<{
  storyDocs: string | null;
  meta: ComponentMeta | null;
}>();
</script>

<template>
  <div class="h-full overflow-auto custom-scrollbar bg-[#0d1117] p-8">
    <div class="max-w-4xl mx-auto space-y-10">
      
      <!-- Markdown Documentation -->
      <div v-if="storyDocs">
        <div class="prose prose-invert max-w-none prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700" v-html="storyDocs"></div>
      </div>
      <div v-else class="p-8 border border-gray-800 border-dashed rounded-xl text-center text-gray-500">
        <UIcon name="DocumentText" class="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p class="text-sm">No <code>&lt;docs&gt;</code> block found in story file.</p>
      </div>

      <!-- API Reference -->
      <div v-if="meta" class="space-y-6">
        <h2 class="text-xl font-bold text-white border-b border-gray-700 pb-2">API Reference</h2>
        
        <!-- Props -->
        <div v-if="meta.props.length">
          <h3 class="text-sm font-bold text-gray-400 uppercase mb-4">Props</h3>
          <div class="border border-gray-700 rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left bg-gray-800/50">
              <thead class="text-xs text-gray-400 uppercase bg-gray-800 border-b border-gray-700">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Type</th>
                  <th class="px-4 py-3">Default</th>
                  <th class="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr v-for="prop in meta.props" :key="prop.name" class="hover:bg-gray-800 transition-colors">
                  <td class="px-4 py-3 font-mono text-blue-400 font-medium">
                    {{ prop.name }}<span v-if="prop.required" class="text-red-400" title="Required">*</span>
                  </td>
                  <td class="px-4 py-3 font-mono text-purple-300 text-xs">{{ prop.type }}</td>
                  <td class="px-4 py-3 font-mono text-gray-500 text-xs">{{ prop.default || '-' }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ prop.description || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Events -->
        <div v-if="meta.events.length">
          <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 mt-8">Events</h3>
          <div class="border border-gray-700 rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left bg-gray-800/50">
              <thead class="text-xs text-gray-400 uppercase bg-gray-800 border-b border-gray-700">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr v-for="evt in meta.events" :key="evt.name" class="hover:bg-gray-800 transition-colors">
                  <td class="px-4 py-3 font-mono text-green-400 font-medium">@{{ evt.name }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ evt.description || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Slots -->
        <div v-if="meta.slots.length">
          <h3 class="text-sm font-bold text-gray-400 uppercase mb-4 mt-8">Slots</h3>
          <div class="border border-gray-700 rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left bg-gray-800/50">
              <thead class="text-xs text-gray-400 uppercase bg-gray-800 border-b border-gray-700">
                <tr>
                  <th class="px-4 py-3">Name</th>
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3">Bindings</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                <tr v-for="slot in meta.slots" :key="slot.name" class="hover:bg-gray-800 transition-colors">
                  <td class="px-4 py-3 font-mono text-yellow-400 font-medium">#{{ slot.name }}</td>
                  <td class="px-4 py-3 text-gray-300">{{ slot.description || '-' }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs font-mono">{{ slot.bindings || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
