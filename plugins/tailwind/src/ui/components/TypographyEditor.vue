<script setup lang="ts">
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{
  classes: string[];
  onChange: (classes: string[]) => void;
}>();

// Helper to replace class by regex prefix
const setClass = (prefixRegex: RegExp, newClass: string) => {
  const clean = props.classes.filter((c) => !prefixRegex.test(c));
  if (newClass) {
    clean.push(newClass);
  }
  props.onChange(clean);
};

const getValue = (prefixRegex: RegExp): string => {
  return props.classes.find((c) => prefixRegex.test(c)) || '';
};
</script>

<template>
  <div class="p-4 bg-gray-800 rounded border border-gray-700 space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xs font-bold text-gray-400 uppercase">Typography</span>
      <UIcon name="DocumentText" class="w-4 h-4 text-gray-500" />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <!-- Size -->
      <div>
        <label class="text-[10px] text-gray-500 mb-1 block">Size</label>
        <select
          :value="getValue(/^text-(xs|sm|base|lg|xl|\d+xl)$/)"
          @change="(e: any) => setClass(/^text-(xs|sm|base|lg|xl|\d+xl)$/, e.target.value)"
          class="w-full bg-gray-900 border border-gray-700 rounded text-xs text-white p-1.5 outline-none focus:border-indigo-500"
        >
          <option value="">Inherit</option>
          <option value="text-xs">xs (12px)</option>
          <option value="text-sm">sm (14px)</option>
          <option value="text-base">base (16px)</option>
          <option value="text-lg">lg (18px)</option>
          <option value="text-xl">xl (20px)</option>
          <option value="text-2xl">2xl (24px)</option>
          <option value="text-3xl">3xl (30px)</option>
          <option value="text-4xl">4xl (36px)</option>
        </select>
      </div>

      <!-- Weight -->
      <div>
        <label class="text-[10px] text-gray-500 mb-1 block">Weight</label>
        <select
          :value="getValue(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)"
          @change="(e: any) => setClass(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/, e.target.value)"
          class="w-full bg-gray-900 border border-gray-700 rounded text-xs text-white p-1.5 outline-none focus:border-indigo-500"
        >
          <option value="">Inherit</option>
          <option value="font-thin">Thin (100)</option>
          <option value="font-extralight">Extra Light (200)</option>
          <option value="font-light">Light (300)</option>
          <option value="font-normal">Normal (400)</option>
          <option value="font-medium">Medium (500)</option>
          <option value="font-semibold">Semibold (600)</option>
          <option value="font-bold">Bold (700)</option>
          <option value="font-extrabold">Extra Bold (800)</option>
          <option value="font-black">Black (900)</option>
        </select>
      </div>

      <!-- Leading (Line Height) -->
      <div>
        <label class="text-[10px] text-gray-500 mb-1 block">Line Height</label>
        <div class="flex bg-gray-900 rounded border border-gray-700 p-0.5 gap-0.5">
          <button
            @click="setClass(/^leading-/, 'leading-none')"
            :class="getValue(/^leading-none$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="1"
          >
            <UIcon name="Bars2" class="w-3 h-3 mx-auto" />
          </button>
          <button
            @click="setClass(/^leading-/, 'leading-tight')"
            :class="getValue(/^leading-tight$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="1.25"
          >
            <UIcon name="Bars3" class="w-3 h-3 mx-auto" />
          </button>
          <button
            @click="setClass(/^leading-/, 'leading-normal')"
            :class="getValue(/^leading-normal$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="1.5"
          >
            <UIcon name="Bars4" class="w-3 h-3 mx-auto" />
          </button>
          <button
            @click="setClass(/^leading-/, 'leading-loose')"
            :class="getValue(/^leading-loose$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="2"
          >
            <UIcon name="ArrowsUpDown" class="w-3 h-3 mx-auto" />
          </button>
        </div>
      </div>

      <!-- Align -->
      <div>
        <label class="text-[10px] text-gray-500 mb-1 block">Align</label>
        <div class="flex bg-gray-900 rounded border border-gray-700 p-0.5 gap-0.5">
          <button
            @click="setClass(/^text-(left|center|right|justify)/, 'text-left')"
            :class="getValue(/^text-left$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="Left"
          >
            <UIcon name="Bars3BottomLeft" class="w-3 h-3 mx-auto" />
          </button>
          <button
            @click="setClass(/^text-(left|center|right|justify)/, 'text-center')"
            :class="getValue(/^text-center$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="Center"
          >
            <UIcon name="Bars3" class="w-3 h-3 mx-auto" />
          </button>
          <button
            @click="setClass(/^text-(left|center|right|justify)/, 'text-right')"
            :class="getValue(/^text-right$/) ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700'"
            class="flex-1 rounded p-1 transition-colors"
            title="Right"
          >
            <UIcon name="Bars3BottomRight" class="w-3 h-3 mx-auto" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

