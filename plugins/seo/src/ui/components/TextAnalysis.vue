<script setup lang="ts">
import { UCard, UTable, UStat, UBadge } from '@u-devtools/ui';
import type { TextStats } from '../../types';

const props = defineProps<{
  stats: TextStats;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Main Stats Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <UStat 
        label="Words" 
        :value="stats.wordCount" 
        size="sm"
      />
      <UStat 
        label="Read Time" 
        :value="`~${stats.readingTimeMinutes} min`" 
        size="sm" 
        color="indigo"
      />
      <UStat 
        label="Sentences" 
        :value="stats.sentenceCount" 
        size="sm"
      />
      <UStat 
        label="Paragraphs" 
        :value="stats.paragraphCount" 
        size="sm"
      />
    </div>

    <!-- Keyword Density Table -->
    <UCard title="Top Keywords (Density)" class="border-gray-800">
      <div v-if="stats.keywords.length === 0" class="p-4 text-sm text-gray-500 italic">
        Not enough text content to analyze.
      </div>
      <div v-else>
        <!-- Table Header -->
        <div class="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-2 bg-gray-800 border-b border-gray-700 text-xs font-bold text-gray-400 uppercase">
          <div>Keyword</div>
          <div class="text-right">Count</div>
          <div class="text-right">Density</div>
        </div>
        
        <!-- Table Body -->
        <div class="divide-y divide-gray-700/50">
          <div 
            v-for="(kw, idx) in stats.keywords" 
            :key="kw.word" 
            class="grid grid-cols-[1fr_80px_80px] gap-4 px-4 py-2 text-sm hover:bg-gray-800/50 transition-colors items-center"
          >
            <div class="flex items-center gap-2">
              <span class="text-gray-500 font-mono text-xs w-4">{{ idx + 1 }}.</span>
              <span class="text-white font-medium">{{ kw.word }}</span>
            </div>
            <div class="text-right text-gray-400">
              {{ kw.count }}
            </div>
            <div class="text-right">
              <UBadge 
                :color="parseFloat(kw.density) > 2.5 ? 'red' : parseFloat(kw.density) > 1 ? 'green' : 'gray'" 
                size="xs"
              >
                {{ kw.density }}
              </UBadge>
            </div>
          </div>
        </div>
        
        <div class="p-3 bg-gray-900/50 border-t border-gray-700 text-xs text-gray-500 text-center">
          Ideally, main keywords should have 1-3% density. &gt;4-5% might be considered keyword stuffing.
        </div>
      </div>
    </UCard>
  </div>
</template>

