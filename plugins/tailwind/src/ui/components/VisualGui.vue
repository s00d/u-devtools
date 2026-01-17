<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  classes: string[];
  onChange: (newClasses: string[]) => void;
}>();

// Helper: check if class exists
const has = (cls: string) => props.classes.includes(cls);

// Helper: toggle with conflict removal
const toggle = (cls: string, regex: RegExp) => {
  // 1. Remove all conflicting
  let newArr = props.classes.filter((c) => !regex.test(c));

  // 2. If class wasn't there - add it. If it was - we removed it in step 1 (toggle off)
  // But if this was a "group" (e.g., display), and we clicked flex, but block was there
  // Then we removed block and should add flex.
  // Logic: if we click on ACTIVE - remove. If on INACTIVE - replace.

  const wasActive = props.classes.includes(cls);
  if (!wasActive) {
    newArr.push(cls);
  }

  props.onChange(newArr);
};

const isFlex = computed(() => has('flex') || has('inline-flex'));
</script>

<template>
  <div class="space-y-4">
    <!-- LAYOUT -->
    <div class="p-3 bg-gray-800 rounded border border-gray-700">
      <div class="text-[10px] font-bold text-gray-400 uppercase mb-2">Display</div>
      <div class="flex gap-1">
        <button
          v-for="d in ['block', 'flex', 'grid', 'inline-block', 'hidden']"
          :key="d"
          @click="toggle(d, /^(block|flex|grid|inline|hidden|inline-block|inline-flex)$/)"
          class="flex-1 py-1.5 rounded text-xs transition-all border"
          :class="has(d) ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-gray-700 text-gray-400 border-transparent hover:bg-gray-600'"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <!-- FLEX CONTROLS (Show only if flex) -->
    <div
      v-if="isFlex"
      class="p-3 bg-gray-800 rounded border border-gray-700 space-y-3"
    >
      <div>
        <div class="text-[10px] font-bold text-gray-400 uppercase mb-2">Direction</div>
        <div class="flex gap-1 bg-gray-900 p-1 rounded">
          <button
            @click="toggle('flex-row', /^flex-(row|col)/)"
            :class="{ 'bg-gray-700 text-white': has('flex-row') || !has('flex-col'), 'text-gray-500': has('flex-col') }"
            class="flex-1 rounded py-1 text-xs transition-colors"
          >
            Row
          </button>
          <button
            @click="toggle('flex-col', /^flex-(row|col)/)"
            :class="{ 'bg-gray-700 text-white': has('flex-col'), 'text-gray-500': !has('flex-col') }"
            class="flex-1 rounded py-1 text-xs transition-colors"
          >
            Col
          </button>
        </div>
      </div>

      <!-- Justify -->
      <div>
        <div class="text-[10px] font-bold text-gray-400 uppercase mb-2">Justify</div>
        <div class="grid grid-cols-6 gap-1">
          <button
            @click="toggle('justify-start', /^justify-/)"
            :class="has('justify-start') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Start"
          >
            <UIcon name="Bars3BottomLeft" class="rotate-90 w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('justify-center', /^justify-/)"
            :class="has('justify-center') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Center"
          >
            <UIcon name="Bars2" class="rotate-90 w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('justify-end', /^justify-/)"
            :class="has('justify-end') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            title="End"
          >
            <UIcon name="Bars3BottomRight" class="rotate-90 w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('justify-between', /^justify-/)"
            :class="has('justify-between') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Between"
          >
            <UIcon name="ArrowsRightLeft" class="w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('justify-around', /^justify-/)"
            :class="has('justify-around') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Around"
          >
            <UIcon name="ArrowsPointingOut" class="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>

      <!-- Align -->
      <div>
        <div class="text-[10px] font-bold text-gray-400 uppercase mb-2">Items (Align)</div>
        <div class="grid grid-cols-5 gap-1">
          <button
            @click="toggle('items-start', /^items-/)"
            :class="has('items-start') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <UIcon name="BarsArrowUp" class="w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('items-center', /^items-/)"
            :class="has('items-center') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <UIcon name="Bars2" class="w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('items-end', /^items-/)"
            :class="has('items-end') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <UIcon name="BarsArrowDown" class="w-5 h-5 mx-auto" />
          </button>
          <button
            @click="toggle('items-stretch', /^items-/)"
            :class="has('items-stretch') ? 'text-indigo-400' : 'text-gray-500'"
            class="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <UIcon name="ArrowsUpDown" class="w-5 h-5 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

