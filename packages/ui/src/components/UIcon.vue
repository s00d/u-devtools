<script setup lang="ts">
defineProps<{
  name: string;
  size?: string;
}>();
</script>

<template>
  <div :class="name" :style="{ fontSize: size }" class="inline-block" />
</template>
