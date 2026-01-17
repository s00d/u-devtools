<script setup lang="ts">
import { computed } from 'vue';
import { groupClassesByBreakpoint } from '../../utils/classes';

const props = defineProps<{
  classes: string[];
  onChange: (newClasses: string[]) => void;
}>();

const screens = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

// Break down current classes by columns
const matrix = computed(() => groupClassesByBreakpoint(props.classes));

// Update specific breakpoint
const updateBreakpoint = (screen: string, newUtilsStr: string) => {
  const newUtils = newUtilsStr
    .split(' ')
    .map((c) => c.trim())
    .filter(Boolean);

  // Reassemble all classes back into one array
  const finalClasses: string[] = [];

  screens.forEach((s) => {
    if (s === screen) {
      // Add prefix for changed column (if not base)
      const prefix = s === 'base' ? '' : `${s}:`;
      finalClasses.push(...newUtils.map((u) => `${prefix}${u}`));
    } else {
      // Keep others as is, restoring prefixes
      const prefix = s === 'base' ? '' : `${s}:`;
      finalClasses.push(...matrix.value[s].map((u) => `${prefix}${u}`));
    }
  });

  props.onChange(finalClasses);
};
</script>

<template>
  <div class="overflow-x-auto border border-gray-700 rounded-lg bg-gray-800">
    <table class="w-full text-left text-sm border-collapse">
      <thead>
        <tr class="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs uppercase">
          <th class="p-2 border-r border-gray-700 w-16">Screen</th>
          <th class="p-2">Classes (Utilities)</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="screen in screens"
          :key="screen"
          class="border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30 transition-colors"
        >
          <td class="p-2 border-r border-gray-700 font-mono text-indigo-400 font-bold">
            {{ screen }}
          </td>
          <td class="p-1">
            <input
              :value="matrix[screen].join(' ')"
              @change="(e: any) => updateBreakpoint(screen, e.target.value)"
              class="w-full bg-transparent outline-none text-gray-200 placeholder-gray-600 font-mono text-xs py-1 px-2 rounded border border-gray-700 hover:border-gray-600 focus:border-indigo-500 transition-colors"
              placeholder="Add classes..."
            />
          </td>
        </tr>
      </tbody>
    </table>
    <div class="p-2 text-[10px] text-gray-500 bg-gray-900/50 border-t border-gray-700">
      Tip: Type utilities directly (e.g. "p-4 flex"). Prefixes (md:) are handled automatically.
    </div>
  </div>
</template>

