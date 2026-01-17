<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{ data: any }>();

const questions = computed(() => {
  if (!props.data.mainEntity) return [];
  return Array.isArray(props.data.mainEntity) ? props.data.mainEntity : [props.data.mainEntity];
});
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden font-sans">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
          <UIcon name="QuestionMarkCircle" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-gray-900">Frequently Asked Questions</h3>
          <p class="text-sm text-gray-600">{{ questions.length }} questions</p>
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="divide-y divide-gray-200">
      <div
        v-for="(qa, index) in questions"
        :key="index"
        class="px-6 py-5 hover:bg-gray-50 transition-colors"
      >
        <!-- Question -->
        <div class="flex items-start gap-3 mb-2">
          <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span class="text-xs font-bold text-blue-600">Q</span>
          </div>
          <h4 class="text-base font-semibold text-gray-900 leading-snug flex-1">
            {{ qa.name || qa.question || 'Question' }}
          </h4>
        </div>

        <!-- Answer -->
        <div class="flex items-start gap-3 ml-9">
          <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span class="text-xs font-bold text-green-600">A</span>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-700 leading-relaxed">
              {{ qa.acceptedAnswer?.text || qa.answer?.text || qa.acceptedAnswer || qa.answer || 'No answer provided' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 text-center">
      This FAQ may appear in Google search results
    </div>
  </div>
</template>


