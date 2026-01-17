<script setup lang="ts">
import { computed } from 'vue';
import { useDevToolsState } from '../composables/useDevToolsState';
import PluginRenderer from '../components/PluginRenderer.vue';
import { createApiForPlugin } from '../modules/clientApi';
import { UEmpty } from '@u-devtools/ui';

const props = defineProps<{
  pluginName: string;
}>();

const { plugins } = useDevToolsState();

const targetPlugin = computed(() => plugins.value.find((p) => p.name === props.pluginName));

// Создаем API специфичное для этого плагина
const pluginApi = computed(() =>
  targetPlugin.value ? createApiForPlugin(targetPlugin.value.name) : null
);
</script>

<template>
  <div class="h-full w-full">
    <PluginRenderer 
      v-if="targetPlugin && pluginApi" 
      :plugin-name="targetPlugin.name"
      :renderer="targetPlugin.renderMain" 
      :api="pluginApi" 
    />
    
    <UEmpty 
      v-else
      icon="CubeTransparent"
      title="Plugin Not Found"
      :description="`Plugin '${pluginName}' is not installed or active.`"
    />
  </div>
</template>

