<script setup lang="ts">
import { ref } from 'vue';
import { UButton, UCard, UBadge } from '@u-devtools/ui';

const count = ref(0);
</script>

<template>
  <div class="space-y-6">
    <UCard title="Basic Components">
      <div class="space-y-4">
        <div>
          <h3 class="text-sm font-semibold mb-2">Buttons</h3>
          <div class="flex gap-2 flex-wrap">
            <UButton label="Primary" />
            <UButton label="Secondary" variant="secondary" />
            <UButton label="Ghost" variant="ghost" />
            <UButton label="Danger" variant="danger" />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Badges</h3>
          <div class="flex gap-2 flex-wrap">
            <UBadge label="Default" />
            <UBadge label="Success" variant="success" />
            <UBadge label="Warning" variant="warning" />
            <UBadge label="Error" variant="error" />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold mb-2">Counter Example</h3>
          <div class="flex items-center gap-4">
            <UButton label="-" @click="count--" />
            <span class="text-xl font-mono">{{ count }}</span>
            <UButton label="+" @click="count++" />
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

