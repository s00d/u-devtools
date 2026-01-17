<script setup lang="ts">
import { shallowRef, onMounted, onBeforeUnmount } from 'vue';
import { useBridge } from '../context';
import type { ComponentsbookProtocol } from '../types';

const bridge = useBridge();

const currentComponent = shallowRef<any>(null);
const currentProps = shallowRef<Record<string, any>>({});
const currentSlots = shallowRef<Record<string, any>>({});

const handleSelectStory = async ({ path, slots }: { path: string; slots?: Record<string, any> }) => {
  try {
    // Request resolved path from client via bridge using request/response pattern
    const response = await bridge.request<{ path: string }, { path: string; resolvedPath: string }>(
      'componentsbook:request-story-path',
      { path },
      'componentsbook:story-path-response',
      5000,
      (request, response) => request.path === response.path // Filter to match request
    );
    
    if (response.resolvedPath) {
      // Dynamically import the story component
      const module = await import(/* @vite-ignore */ response.resolvedPath);
      currentComponent.value = module.default;
      currentProps.value = {}; // Reset props
      currentSlots.value = slots || {}; // Set slots if provided
    } else {
      console.warn(`[componentsbook] Story not found: ${path}`);
      currentComponent.value = null;
    }
  } catch (e) {
    console.error('[componentsbook] Error loading story:', e);
    currentComponent.value = null;
  }
};

const handleUpdateProps = ({ props }: { props: Record<string, any> }) => {
  currentProps.value = props;
};

let unsubscribeSelectStory: (() => void) | null = null;
let unsubscribeUpdateProps: (() => void) | null = null;

onMounted(() => {
  unsubscribeSelectStory = bridge.on('componentsbook:select-story', handleSelectStory);
  unsubscribeUpdateProps = bridge.on('componentsbook:update-props', handleUpdateProps);
});

onBeforeUnmount(() => {
  if (unsubscribeSelectStory) unsubscribeSelectStory();
  if (unsubscribeUpdateProps) unsubscribeUpdateProps();
});
</script>

<template>
  <div
    v-if="currentComponent"
    class="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]"
  >
    <!-- Container for component -->
    <div
      class="pointer-events-auto bg-white dark:bg-gray-900 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-[90vw] max-h-[80vh] overflow-auto"
    >
      <component :is="currentComponent" v-bind="currentProps">
        <template v-for="(slotContent, slotName) in currentSlots" :key="slotName" #[slotName]>
          <component v-if="typeof slotContent === 'object' && slotContent !== null" :is="slotContent" />
          <span v-else>{{ slotContent }}</span>
        </template>
      </component>
    </div>
  </div>
</template>
