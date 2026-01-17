<script setup lang="ts">
import HomeHeader from '../components/home/HomeHeader.vue';
import PiniaStoreDemo from '../components/home/PiniaStoreDemo.vue';
import NetworkLoggerDemo from '../components/home/NetworkLoggerDemo.vue';
import I18nEditorDemo from '../components/home/I18nEditorDemo.vue';
import DOMInspectorDemo from '../components/home/DOMInspectorDemo.vue';
</script>

<template>
  <div class="max-w-4xl mx-auto p-8">
    <HomeHeader />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <PiniaStoreDemo />
      <NetworkLoggerDemo />
      <I18nEditorDemo />
      <DOMInspectorDemo />
    </div>
  </div>
</template>

