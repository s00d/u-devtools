<script setup lang="ts">
import AboutPanel from '../components/AboutPanel.vue';
import PluginManager from '../components/PluginManager.vue';
import { systemApi } from '../modules/clientApi';

defineProps<{
  view: 'about' | 'marketplace';
}>();
</script>

<template>
  <div class="h-full w-full">
    <AboutPanel v-if="view === 'about'" />
    <PluginManager v-else-if="view === 'marketplace'" :api="systemApi" />
  </div>
</template>

