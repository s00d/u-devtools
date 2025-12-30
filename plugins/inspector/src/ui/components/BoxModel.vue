<script setup lang="ts">
import BoxValue from './BoxValue.vue';

defineProps<{
  styles: Record<string, string>;
}>();

const emit = defineEmits(['update']);

const onUpdate = (payload: { prop: string; value: string }) => {
  emit('update', payload);
};
</script>

<template>
  <div class="flex justify-center py-4 select-none font-mono text-[10px] leading-none">
    
    <!-- MARGIN (Orange) -->
    <div class="relative flex justify-center items-center border border-amber-900 rounded-sm transition-colors bg-amber-900 text-amber-200 p-6">
      <div class="absolute top-0.5 left-1 text-[8px] opacity-70 pointer-events-none uppercase text-amber-200">margin</div>
      
      <div class="absolute top-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.marginTop" prop="marginTop" @update="onUpdate" /></div>
      <div class="absolute bottom-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.marginBottom" prop="marginBottom" @update="onUpdate" /></div>
      <div class="absolute left-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.marginLeft" prop="marginLeft" @update="onUpdate" /></div>
      <div class="absolute right-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.marginRight" prop="marginRight" @update="onUpdate" /></div>

      <!-- BORDER (Yellow) -->
      <div class="relative flex justify-center items-center border border-yellow-900 rounded-sm transition-colors bg-yellow-900 text-yellow-200 p-6 w-full h-full">
        <div class="absolute top-0.5 left-1 text-[8px] opacity-70 pointer-events-none uppercase text-yellow-100">border</div>
        
        <div class="absolute top-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.borderTopWidth" prop="borderTopWidth" @update="onUpdate" /></div>
        <div class="absolute bottom-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.borderBottomWidth" prop="borderBottomWidth" @update="onUpdate" /></div>
        <div class="absolute left-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.borderLeftWidth" prop="borderLeftWidth" @update="onUpdate" /></div>
        <div class="absolute right-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.borderRightWidth" prop="borderRightWidth" @update="onUpdate" /></div>

        <!-- PADDING (Green) -->
        <div class="relative flex justify-center items-center border border-green-900 rounded-sm transition-colors bg-green-900 text-green-300 p-6 w-full h-full">
          <div class="absolute top-0.5 left-1 text-[8px] opacity-70 pointer-events-none uppercase text-green-400">padding</div>
          
          <div class="absolute top-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.paddingTop" prop="paddingTop" @update="onUpdate" /></div>
          <div class="absolute bottom-0.5 left-0 w-full flex justify-center items-center"><BoxValue :value="styles.paddingBottom" prop="paddingBottom" @update="onUpdate" /></div>
          <div class="absolute left-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.paddingLeft" prop="paddingLeft" @update="onUpdate" /></div>
          <div class="absolute right-0.5 top-0 h-full flex items-center"><BoxValue :value="styles.paddingRight" prop="paddingRight" @update="onUpdate" /></div>

          <!-- CONTENT (Blue) -->
          <div class="relative flex items-center justify-center border border-blue-900 rounded-sm transition-colors bg-blue-900 text-blue-300 min-w-[80px] h-[26px]">
            <BoxValue :value="styles.width" prop="width" @update="onUpdate" />
            <span class="mx-1 opacity-50">×</span>
            <BoxValue :value="styles.height" prop="height" @update="onUpdate" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
