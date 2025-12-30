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
    <div class="box-layer margin">
      <div class="label top-left text-[#b45309] dark:text-[#fde68a]">margin</div>
      
      <div class="val top"><BoxValue :value="styles.marginTop" prop="marginTop" @update="onUpdate" /></div>
      <div class="val bottom"><BoxValue :value="styles.marginBottom" prop="marginBottom" @update="onUpdate" /></div>
      <div class="val left"><BoxValue :value="styles.marginLeft" prop="marginLeft" @update="onUpdate" /></div>
      <div class="val right"><BoxValue :value="styles.marginRight" prop="marginRight" @update="onUpdate" /></div>

      <!-- BORDER (Yellow) -->
      <div class="box-layer border-layer">
        <div class="label top-left text-[#854d0e] dark:text-[#fef3c7]">border</div>
        
        <div class="val top"><BoxValue :value="styles.borderTopWidth" prop="borderTopWidth" @update="onUpdate" /></div>
        <div class="val bottom"><BoxValue :value="styles.borderBottomWidth" prop="borderBottomWidth" @update="onUpdate" /></div>
        <div class="val left"><BoxValue :value="styles.borderLeftWidth" prop="borderLeftWidth" @update="onUpdate" /></div>
        <div class="val right"><BoxValue :value="styles.borderRightWidth" prop="borderRightWidth" @update="onUpdate" /></div>

        <!-- PADDING (Green) -->
        <div class="box-layer padding">
          <div class="label top-left text-[#166534] dark:text-[#86efac]">padding</div>
          
          <div class="val top"><BoxValue :value="styles.paddingTop" prop="paddingTop" @update="onUpdate" /></div>
          <div class="val bottom"><BoxValue :value="styles.paddingBottom" prop="paddingBottom" @update="onUpdate" /></div>
          <div class="val left"><BoxValue :value="styles.paddingLeft" prop="paddingLeft" @update="onUpdate" /></div>
          <div class="val right"><BoxValue :value="styles.paddingRight" prop="paddingRight" @update="onUpdate" /></div>

          <!-- CONTENT (Blue) -->
          <div class="box-layer content">
            <BoxValue :value="styles.width" prop="width" @update="onUpdate" />
            <span class="mx-1 opacity-50">×</span>
            <BoxValue :value="styles.height" prop="height" @update="onUpdate" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* Общие стили слоев */
.box-layer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 2px;
  transition: background-color 0.2s;
}

/* Лейблы (margin, border...) */
.label {
  position: absolute;
  font-size: 8px;
  opacity: 0.7;
  pointer-events: none;
  text-transform: uppercase;
}
.label.top-left { top: 2px; left: 3px; }

/* Позиционирование значений */
.val { position: absolute; display: flex; justify-content: center; align-items: center; }
.val.top { top: 2px; left: 0; width: 100%; }
.val.bottom { bottom: 2px; left: 0; width: 100%; }
.val.left { left: 2px; top: 0; height: 100%; display: flex; align-items: center; }
.val.right { right: 2px; top: 0; height: 100%; display: flex; align-items: center; }

/* 
  ЦВЕТА (Chrome DevTools Style) 
  Используем фиксированные цвета для узнаваемости, но адаптируем под темную тему 
*/

/* Margin */
.margin { 
  background-color: #f9cc9d; 
  color: #333; 
  padding: 24px; 
}
:global(.dark) .margin { 
  background-color: #3f2e1e; /* Темно-оранжевый */
  color: #eebb8a; 
  border-color: #553e2a; 
}

/* Border */
.border-layer { 
  background-color: #fceea7; 
  color: #333; 
  padding: 24px; 
  width: 100%; height: 100%; 
}
:global(.dark) .border-layer { 
  background-color: #3f3a1e; /* Темно-желтый */
  color: #eadc8e; 
  border-color: #56502a;
}

/* Padding */
.padding { 
  background-color: #c3e5b3; 
  color: #333; 
  padding: 24px; 
  width: 100%; height: 100%; 
}
:global(.dark) .padding { 
  background-color: #21351e; /* Темно-зеленый */
  color: #acd49b; 
  border-color: #2e4a2a;
}

/* Content */
.content { 
  background-color: #9ccbf7; 
  color: #333; 
  min-width: 80px; height: 26px; 
  display: flex; align-items: center; justify-content: center; 
}
:global(.dark) .content { 
  background-color: #1e2b3f; /* Темно-синий */
  color: #94c1e8; 
  border-color: #2a3c56;
}
</style>
