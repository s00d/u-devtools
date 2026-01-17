<script setup lang="ts">
</script>

<template>
  <div 
    class="flex-1 flex flex-col min-w-0 min-h-0 relative z-0 overflow-hidden bg-zinc-950"
  >
    <!-- Vue Router View -->
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

