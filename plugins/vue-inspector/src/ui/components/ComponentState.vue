<script setup lang="ts">
import { computed } from 'vue';
import type { ComponentState } from '../../types';
import { UJsonTree, UEmpty, ULoading } from '@u-devtools/ui';

const props = defineProps<{
  state: ComponentState | null;
  isLoading?: boolean;
}>();

const hasState = computed(() => {
  if (!props.state) {
    return false;
  }
  const hasProps =
    props.state.props && Array.isArray(props.state.props) && props.state.props.length > 0;
  const hasData =
    props.state.data && Array.isArray(props.state.data) && props.state.data.length > 0;
  const hasComputed =
    props.state.computed && Array.isArray(props.state.computed) && props.state.computed.length > 0;
  const hasSetupState =
    props.state.setupState &&
    typeof props.state.setupState === 'object' &&
    Object.keys(props.state.setupState).length > 0;
  const hasMethods =
    props.state.methods && Array.isArray(props.state.methods) && props.state.methods.length > 0;
  const hasAttrs =
    props.state.attrs && Array.isArray(props.state.attrs) && props.state.attrs.length > 0;
  const hasProvide =
    props.state.provide && Array.isArray(props.state.provide) && props.state.provide.length > 0;
  const hasInject =
    props.state.inject && Array.isArray(props.state.inject) && props.state.inject.length > 0;
  const hasRefs =
    props.state.refs && Array.isArray(props.state.refs) && props.state.refs.length > 0;

  return !!(
    hasProps ||
    hasData ||
    hasComputed ||
    hasSetupState ||
    hasMethods ||
    hasAttrs ||
    hasProvide ||
    hasInject ||
    hasRefs
  );
});

// Convert array-based state to object for UJsonTree
const stateObject = computed(() => {
  if (!props.state) return null;

  const result: Record<string, unknown> = {};

  if (props.state.props && props.state.props.length > 0) {
    result.props = props.state.props.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  if (props.state.data && props.state.data.length > 0) {
    result.data = props.state.data.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  if (props.state.computed && props.state.computed.length > 0) {
    result.computed = props.state.computed.reduce(
      (acc, item) => {
        acc[item.key] = item.value;
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  if (props.state.setupState) {
    result.setupState = props.state.setupState;
  }

  if (props.state.methods && props.state.methods.length > 0) {
    result.methods = props.state.methods;
  }

  return result;
});
</script>

<template>
  <div class="h-full overflow-auto bg-gray-900 p-4">
    <div v-if="isLoading" class="flex items-center justify-center h-full">
      <ULoading text="Loading component state..." />
    </div>
    <div v-else-if="!hasState" class="flex items-center justify-center h-full">
      <UEmpty
        icon="DocumentText"
        title="No component selected"
        description="Select a component from the tree to view its state"
      />
    </div>
    <div v-else-if="stateObject" class="space-y-6">
      <div v-if="stateObject.props" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Props</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <UJsonTree :data="stateObject.props" />
        </div>
      </div>

      <div v-if="stateObject.data" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Data</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <UJsonTree :data="stateObject.data" />
        </div>
      </div>

      <div v-if="stateObject.computed" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Computed</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <UJsonTree :data="stateObject.computed" />
        </div>
      </div>

      <div v-if="stateObject.setupState" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Setup State</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <UJsonTree :data="stateObject.setupState" />
        </div>
      </div>

      <div v-if="stateObject.methods && Array.isArray(stateObject.methods) && stateObject.methods.length > 0" class="space-y-2">
        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Methods</h3>
        <div class="bg-gray-800 rounded border border-gray-700 p-3">
          <div class="space-y-1">
            <div
              v-for="method in stateObject.methods"
              :key="method"
              class="text-sm font-mono text-gray-300 py-1 px-2 hover:bg-gray-700 rounded"
            >
              {{ method }}()
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "tailwindcss";
</style>

