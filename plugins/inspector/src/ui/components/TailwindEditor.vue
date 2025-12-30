<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UIcon, UInput } from '@u-devtools/ui';

const props = defineProps<{
  classes: string[];
}>();

const emit = defineEmits<(e: 'update', classes: string[]) => void>();

const customClass = ref('');

// Хелпер для проверки наличия
const has = (cls: string) => props.classes.includes(cls);

// Хелпер для переключения
const toggleClass = (cls: string, groupRegex?: RegExp) => {
  let newClasses = [...props.classes];

  if (groupRegex) {
    // Удаляем конфликтующие классы (например, если ставим p-4, убираем p-2)
    newClasses = newClasses.filter((c) => !groupRegex.test(c));
  }

  if (!has(cls)) {
    newClasses.push(cls);
  } else if (!groupRegex) {
    // Если это просто toggle (без группы), то удаляем, если он уже был
    // Если это группа (как display), то мы уже удалили все regex-ом, и добавили новый
    newClasses = newClasses.filter((c) => c !== cls);
  }

  emit('update', newClasses);
};

const addCustomClass = () => {
  if (!customClass.value.trim()) return;
  const newClasses = [...props.classes, ...customClass.value.trim().split(' ')];
  // Убираем дубликаты
  emit('update', [...new Set(newClasses)]);
  customClass.value = '';
};

const removeClass = (cls: string) => {
  const newClasses = props.classes.filter((c) => c !== cls);
  emit('update', newClasses);
};
</script>

<template>
  <div class="space-y-4 select-none">

    <!-- Custom Class Input -->
    <div class="flex gap-2">
      <UInput
        v-model="customClass"
        placeholder="Add custom class..."
        size="sm"
        class="flex-1"
        @keydown.enter="addCustomClass"
      />
      <UButton size="sm" icon="Plus" @click="addCustomClass" />
    </div>

    <!-- Active Classes List -->
    <div v-if="classes.length > 0" class="flex flex-wrap gap-1.5 p-2.5 bg-gray-800 rounded border border-gray-700">
       <div
         v-for="cls in classes"
         :key="cls"
         class="group flex items-center gap-1.5 px-2.5 py-1 bg-gray-700 rounded border border-gray-600 text-xs font-mono hover:border-gray-500 transition-colors"
       >
          <span class="text-indigo-400">{{ cls }}</span>
          <button @click="removeClass(cls)" class="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-0.5"><UIcon name="XMark" class="w-3 h-3"/></button>
       </div>
    </div>

    <!-- GUI Controls -->
    <div class="space-y-4 border-t border-gray-700 pt-4">

      <!-- LAYOUT -->
      <div class="space-y-2">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Display</div>
        <div class="flex gap-1 p-1 bg-gray-800 rounded border border-gray-700">
          <button @click="toggleClass('block', /^(flex|inline|block|grid|hidden)$/)" :class="{'bg-gray-700 shadow text-indigo-400 border-indigo-500': has('block')}" class="flex-1 p-1.5 rounded hover:bg-gray-700 transition border border-transparent" title="Block"><UIcon name="Stop" class="w-4 h-4 mx-auto"/></button>
          <button @click="toggleClass('flex', /^(flex|inline|block|grid|hidden)$/)" :class="{'bg-gray-700 shadow text-indigo-400 border-indigo-500': has('flex')}" class="flex-1 p-1.5 rounded hover:bg-gray-700 transition border border-transparent" title="Flex"><UIcon name="Squares2X2" class="w-4 h-4 mx-auto"/></button>
          <button @click="toggleClass('grid', /^(flex|inline|block|grid|hidden)$/)" :class="{'bg-gray-700 shadow text-indigo-400 border-indigo-500': has('grid')}" class="flex-1 p-1.5 rounded hover:bg-gray-700 transition border border-transparent" title="Grid"><UIcon name="TableCells" class="w-4 h-4 mx-auto"/></button>
          <button @click="toggleClass('hidden', /^(flex|inline|block|grid|hidden)$/)" :class="{'bg-red-900/30 text-red-400 border-red-500': has('hidden')}" class="flex-1 p-1.5 rounded hover:bg-gray-700 transition border border-transparent" title="Hidden"><UIcon name="EyeSlash" class="w-4 h-4 mx-auto"/></button>
        </div>
      </div>

      <!-- FLEX ALIGNMENT -->
      <div v-if="has('flex')" class="space-y-3 animate-[fadeIn_0.2s_ease-out]">
        <div class="grid grid-cols-2 gap-3">
           <!-- Direction -->
           <div>
              <div class="text-[10px] font-bold text-gray-500 uppercase mb-1">Direction</div>
              <div class="flex gap-1">
                <button @click="toggleClass('flex-row', /^flex-(row|col)/)" :class="{'bg-indigo-900/30 text-indigo-400 font-bold border-indigo-800': !has('flex-col'), 'bg-gray-800 text-gray-500 border-gray-700': has('flex-col')}" class="text-xs flex-1 py-1.5 rounded border">Row</button>
                <button @click="toggleClass('flex-col', /^flex-(row|col)/)" :class="{'bg-indigo-900/30 text-indigo-400 font-bold border-indigo-800': has('flex-col'), 'bg-gray-800 text-gray-500 border-gray-700': !has('flex-col')}" class="text-xs flex-1 py-1.5 rounded border">Col</button>
              </div>
           </div>
           <!-- Wrap -->
           <div>
              <div class="text-[10px] font-bold text-gray-500 uppercase mb-1">Wrap</div>
              <button @click="toggleClass('flex-wrap', /^flex-(wrap|nowrap)/)" :class="{'bg-indigo-900/30 text-indigo-400 font-bold border-indigo-800': has('flex-wrap'), 'bg-gray-800 text-gray-500 border-gray-700': !has('flex-wrap')}" class="w-full text-xs py-1.5 rounded border">Wrap</button>
           </div>
        </div>

        <div class="space-y-1.5">
          <div class="text-[10px] font-bold text-gray-400 uppercase">Justify Content</div>
          <div class="flex gap-1 p-1 bg-gray-800 rounded border border-gray-700">
              <button @click="toggleClass('justify-start', /^justify-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('justify-start')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="Bars3BottomLeft" class="w-4 h-4 rotate-90"/></button>
              <button @click="toggleClass('justify-center', /^justify-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('justify-center')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="Bars2" class="w-4 h-4 rotate-90"/></button>
              <button @click="toggleClass('justify-end', /^justify-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('justify-end')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="Bars3BottomRight" class="w-4 h-4 rotate-90"/></button>
              <button @click="toggleClass('justify-between', /^justify-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('justify-between')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="ArrowsRightLeft" class="w-4 h-4"/></button>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="text-[10px] font-bold text-gray-400 uppercase">Align Items</div>
          <div class="flex gap-1 p-1 bg-gray-800 rounded border border-gray-700">
              <button @click="toggleClass('items-start', /^items-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('items-start')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="BarsArrowUp" class="w-4 h-4"/></button>
              <button @click="toggleClass('items-center', /^items-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('items-center')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="Bars2" class="w-4 h-4"/></button>
              <button @click="toggleClass('items-end', /^items-/)" :class="{'text-indigo-400 bg-gray-700 border-indigo-500': has('items-end')}" class="flex-1 flex justify-center p-1 rounded hover:bg-gray-700 transition border border-transparent"><UIcon name="BarsArrowDown" class="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      <!-- SPACING -->
      <div class="space-y-2">
         <div class="text-[10px] font-bold text-gray-400 uppercase">Padding</div>
         <div class="grid grid-cols-6 gap-1.5">
            <button v-for="i in ['0','1','2','4','6','8']" :key="i" @click="toggleClass(`p-${i}`, /^p-\d+/)" :class="{'bg-indigo-900/30 text-indigo-300 border-indigo-800': has(`p-${i}`), 'bg-gray-800 text-gray-400 border-gray-700': !has(`p-${i}`)}" class="text-xs py-1.5 rounded border hover:bg-gray-800 transition">{{i}}</button>
         </div>
      </div>

      <div class="space-y-2">
         <div class="text-[10px] font-bold text-gray-400 uppercase">Margin</div>
         <div class="grid grid-cols-6 gap-1.5">
            <button v-for="i in ['0','1','2','4','6','8']" :key="i" @click="toggleClass(`m-${i}`, /^m-\d+/)" :class="{'bg-indigo-900/30 text-indigo-300 border-indigo-800': has(`m-${i}`), 'bg-gray-800 text-gray-400 border-gray-700': !has(`m-${i}`)}" class="text-xs py-1.5 rounded border hover:bg-gray-800 transition">{{i}}</button>
         </div>
      </div>

    </div>

  </div>
</template>
