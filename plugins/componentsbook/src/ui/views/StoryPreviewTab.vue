<script setup lang="ts">
import { UEmpty } from '@u-devtools/ui';
import EnhancedPreview from '../components/EnhancedPreview.vue';
import type { ComponentMeta, ComponentPropsMeta } from '../../types';

const props = defineProps<{
  currentStoryComponent: any;
  currentTargetComponent?: any;
  propValues: Record<string, any>;
  componentPropsMeta?: ComponentPropsMeta | null;
  meta?: ComponentMeta | null;
}>();

const emit = defineEmits<{
  'update:props': [props: Record<string, any>];
}>();
</script>

<template>
  <div class="h-full w-full">
    <EnhancedPreview
      v-if="currentStoryComponent"
      :component="currentStoryComponent"
      :target-component="currentTargetComponent"
      :props="propValues"
      :component-props-meta="componentPropsMeta || undefined"
      :meta="meta"
      @update:props="(newProps) => emit('update:props', newProps)"
    />
    <div v-else class="h-full flex items-center justify-center">
      <UEmpty title="Error loading component" description="Check console" icon="ExclamationTriangle" />
    </div>
  </div>
</template>
