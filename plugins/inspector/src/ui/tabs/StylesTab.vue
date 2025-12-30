<script setup lang="ts">
import BoxModel from '../components/BoxModel.vue';
import TailwindEditor from '../components/TailwindEditor.vue';
import ClassesEditor from '../components/ClassesEditor.vue';
import AttributesEditor from '../components/AttributesEditor.vue';
import type { ElementInfo } from '../../composables/useElementData';

const props = defineProps<{
  data: ElementInfo;
}>();

const emit = defineEmits<{
  (e: 'update-classes', classes: string[]): void;
  (e: 'update-attr', name: string, value: string): void;
  (e: 'delete-attr', name: string): void;
  (e: 'add-attr', name: string, value: string): void;
  (e: 'add-class', cls: string): void;
  (e: 'remove-class', cls: string): void;
}>();
</script>

<template>
  <div class="p-4 space-y-4">
    <!-- 1. Box Model (Always visible) -->
    <BoxModel v-if="data.computed" :styles="data.computed" />

    <!-- 2. Tailwind Editor -->
    <div
      class="rounded-lg p-3 border bg-zinc-900/40 border-zinc-900"
    >
      <div class="text-xs font-bold text-gray-400 uppercase mb-3">Quick Styles (Tailwind)</div>
      <TailwindEditor :classes="data.classes" @update="(classes) => emit('update-classes', classes)" />
    </div>

    <!-- 3. Class List -->
    <ClassesEditor
      :classes="data.classes"
      @add="(cls) => emit('add-class', cls)"
      @remove="(cls) => emit('remove-class', cls)"
    />

    <!-- 4. Attributes -->
    <AttributesEditor
      :attrs="data.attrs"
      @update="(payload) => emit('update-attr', payload.name, payload.value)"
      @delete="(name) => emit('delete-attr', name)"
      @add="(payload) => emit('add-attr', payload.name, payload.value)"
    />
  </div>
</template>


