<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  classes: string[];
  onChange: (classes: string[]) => void;
}>();

const spaces = ['0', '1', '2', '3', '4', '6', '8', '12', '16', '20', '24', 'auto'];

// Parse current spacing values
const getSpacing = (prefix: string): string => {
  const regex = new RegExp(`^${prefix}-([0-9.]+|px|auto)$`);
  const found = props.classes.find((c) => regex.test(c));
  return found ? found.split('-').pop() || '0' : '0';
};

const updateSpacing = (prefix: string, val: string) => {
  // Remove old classes of this type (m-*, mx-*, my-*, mt-*...)
  // For simplicity, we work with specific sides: t, r, b, l
  const clean = props.classes.filter((c) => !c.startsWith(`${prefix}-`));
  if (val !== '0') {
    clean.push(`${prefix}-${val}`);
  }
  props.onChange(clean);
};

// Check if all sides have same value
const allSidesEqual = (prefix: string): boolean => {
  const t = getSpacing(`${prefix}t`);
  const r = getSpacing(`${prefix}r`);
  const b = getSpacing(`${prefix}b`);
  const l = getSpacing(`${prefix}l`);
  return t === r && r === b && b === l && t !== '0';
};

// Set all sides to same value
const setAllSides = (prefix: string, val: string) => {
  const clean = props.classes.filter((c) => !c.startsWith(`${prefix}`));
  if (val !== '0') {
    clean.push(`${prefix}-${val}`);
  }
  props.onChange(clean);
};
</script>

<template>
  <div class="flex justify-center p-4 bg-gray-800 rounded border border-gray-700 select-none">
    <!-- MARGIN BOX (Orange) -->
    <div class="relative p-8 bg-orange-900/20 border border-orange-700/50 rounded flex flex-col items-center gap-1">
      <span class="absolute top-1 left-2 text-[9px] text-orange-400 font-bold uppercase">Margin</span>

      <!-- Top -->
      <select
        :value="getSpacing('mt')"
        @change="(e: any) => updateSpacing('mt', e.target.value)"
        class="bg-transparent text-xs text-orange-200 text-center w-12 outline-none appearance-none hover:bg-orange-800/50 rounded cursor-pointer border border-orange-700/30 px-1 py-0.5"
      >
        <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
      </select>

      <div class="flex items-center gap-1">
        <!-- Left -->
        <select
          :value="getSpacing('ml')"
          @change="(e: any) => updateSpacing('ml', e.target.value)"
          class="bg-transparent text-xs text-orange-200 text-center w-8 outline-none appearance-none hover:bg-orange-800/50 rounded cursor-pointer border border-orange-700/30 px-1 py-0.5"
        >
          <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
        </select>

        <!-- BORDER BOX (Yellow) -->
        <div class="relative p-6 bg-yellow-900/20 border border-yellow-700/50 rounded flex flex-col items-center">
          <span class="absolute top-0.5 left-1 text-[8px] text-yellow-500 opacity-70">Border</span>

          <!-- PADDING BOX (Green) -->
          <div class="relative p-2 bg-green-900/20 border border-green-700/50 rounded flex flex-col items-center">
            <span class="absolute top-0 left-1 text-[8px] text-green-500 opacity-70">Padding</span>

            <!-- Padding Controls -->
            <div class="flex flex-col items-center gap-1">
              <!-- Padding Top -->
              <select
                :value="getSpacing('pt')"
                @change="(e: any) => updateSpacing('pt', e.target.value)"
                class="bg-transparent text-xs text-green-200 text-center w-10 outline-none appearance-none hover:bg-green-800/50 rounded cursor-pointer border border-green-700/30 px-1 py-0.5"
              >
                <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
              </select>

              <div class="flex items-center gap-1">
                <!-- Padding Left -->
                <select
                  :value="getSpacing('pl')"
                  @change="(e: any) => updateSpacing('pl', e.target.value)"
                  class="bg-transparent text-xs text-green-200 text-center w-8 outline-none appearance-none hover:bg-green-800/50 rounded cursor-pointer border border-green-700/30 px-1 py-0.5"
                >
                  <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
                </select>

                <!-- Content -->
                <div
                  class="w-16 h-8 flex items-center justify-center bg-blue-900/30 text-blue-300 text-[10px] rounded border border-blue-500/30"
                >
                  Content
                </div>

                <!-- Padding Right -->
                <select
                  :value="getSpacing('pr')"
                  @change="(e: any) => updateSpacing('pr', e.target.value)"
                  class="bg-transparent text-xs text-green-200 text-center w-8 outline-none appearance-none hover:bg-green-800/50 rounded cursor-pointer border border-green-700/30 px-1 py-0.5"
                >
                  <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
                </select>
              </div>

              <!-- Padding Bottom -->
              <select
                :value="getSpacing('pb')"
                @change="(e: any) => updateSpacing('pb', e.target.value)"
                class="bg-transparent text-xs text-green-200 text-center w-10 outline-none appearance-none hover:bg-green-800/50 rounded cursor-pointer border border-green-700/30 px-1 py-0.5"
              >
                <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Right -->
        <select
          :value="getSpacing('mr')"
          @change="(e: any) => updateSpacing('mr', e.target.value)"
          class="bg-transparent text-xs text-orange-200 text-center w-8 outline-none appearance-none hover:bg-orange-800/50 rounded cursor-pointer border border-orange-700/30 px-1 py-0.5"
        >
          <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
        </select>
      </div>

      <!-- Bottom -->
      <select
        :value="getSpacing('mb')"
        @change="(e: any) => updateSpacing('mb', e.target.value)"
        class="bg-transparent text-xs text-orange-200 text-center w-12 outline-none appearance-none hover:bg-orange-800/50 rounded cursor-pointer border border-orange-700/30 px-1 py-0.5"
      >
        <option v-for="s in spaces" :key="s" :value="s" class="bg-gray-900">{{ s }}</option>
      </select>
    </div>
  </div>
</template>

