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
  <div class="box-model-container select-none font-mono text-[10px] leading-none">
    
    <!-- MARGIN -->
    <div class="layer margin group">
      <div class="label text-[#b45309] dark:text-[#fde68a]">margin</div>
      
      <div class="pos top"><BoxValue :value="styles.marginTop" prop="marginTop" position="top" @update="onUpdate" /></div>
      <div class="pos bottom"><BoxValue :value="styles.marginBottom" prop="marginBottom" position="bottom" @update="onUpdate" /></div>
      <div class="pos left"><BoxValue :value="styles.marginLeft" prop="marginLeft" position="left" @update="onUpdate" /></div>
      <div class="pos right"><BoxValue :value="styles.marginRight" prop="marginRight" position="right" @update="onUpdate" /></div>

      <!-- BORDER -->
      <div class="layer border-layer">
        <div class="label text-[#854d0e] dark:text-[#fef3c7]">border</div>
        
        <div class="pos top"><BoxValue :value="styles.borderTopWidth" prop="borderTopWidth" position="top" @update="onUpdate" /></div>
        <div class="pos bottom"><BoxValue :value="styles.borderBottomWidth" prop="borderBottomWidth" position="bottom" @update="onUpdate" /></div>
        <div class="pos left"><BoxValue :value="styles.borderLeftWidth" prop="borderLeftWidth" position="left" @update="onUpdate" /></div>
        <div class="pos right"><BoxValue :value="styles.borderRightWidth" prop="borderRightWidth" position="right" @update="onUpdate" /></div>

        <!-- PADDING -->
        <div class="layer padding">
          <div class="label text-[#166534] dark:text-[#86efac]">padding</div>
          
          <div class="pos top"><BoxValue :value="styles.paddingTop" prop="paddingTop" position="top" @update="onUpdate" /></div>
          <div class="pos bottom"><BoxValue :value="styles.paddingBottom" prop="paddingBottom" position="bottom" @update="onUpdate" /></div>
          <div class="pos left"><BoxValue :value="styles.paddingLeft" prop="paddingLeft" position="left" @update="onUpdate" /></div>
          <div class="pos right"><BoxValue :value="styles.paddingRight" prop="paddingRight" position="right" @update="onUpdate" /></div>

          <!-- CONTENT -->
          <div class="layer content">
            <BoxValue :value="styles.width" prop="width" position="center" @update="onUpdate" />
            <span class="mx-1 opacity-50">×</span>
            <BoxValue :value="styles.height" prop="height" position="center" @update="onUpdate" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box-model-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.layer {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0,0,0,0.05);
  border-radius: 2px;
}

/* Labels (margin, border...) */
.label {
  position: absolute;
  top: 2px;
  left: 3px;
  font-size: 8px;
  opacity: 0.7;
  pointer-events: none;
  text-transform: uppercase;
}

/* Positioning helpers */
.pos { position: absolute; display: flex; justify-content: center; align-items: center; }
.pos.top { top: 2px; left: 0; width: 100%; }
.pos.bottom { bottom: 2px; left: 0; width: 100%; }
.pos.left { left: 4px; top: 0; height: 100%; }
.pos.right { right: 4px; top: 0; height: 100%; }

/* Colors (Light) */
.margin { background-color: #f9cc9d; color: #333; padding: 24px; }
.border-layer { background-color: #fceea7; color: #333; padding: 24px; width: 100%; height: 100%; }
.padding { background-color: #c3e5b3; color: #333; padding: 24px; width: 100%; height: 100%; }
.content { background-color: #9ccbf7; color: #333; width: 90px; height: 30px; display: flex; align-items: center; justify-content: center; }

/* Colors (Dark) */
:global(.dark) .margin { background-color: #573b22; color: #eebb8a; border-color: transparent; }
:global(.dark) .border-layer { background-color: #594f26; color: #eadc8e; border-color: transparent; }
:global(.dark) .padding { background-color: #2e4526; color: #acd49b; border-color: transparent; }
:global(.dark) .content { background-color: #233e56; color: #94c1e8; border-color: transparent; }
</style>
