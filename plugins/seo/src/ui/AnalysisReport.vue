<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';
import type { SeoTags } from '../types';

const props = defineProps<{ data: SeoTags }>();

const checks = computed(() => {
  const list: Array<{ type: 'error' | 'warning' | 'success'; msg: string }> = [];

  // Title
  const tLen = props.data.title.length;
  if (!tLen) list.push({ type: 'error', msg: 'Missing <title> tag' });
  else if (tLen < 30)
    list.push({
      type: 'warning',
      msg: `Title is too short (${tLen} chars). Aim for 50-60.`,
    });
  else if (tLen > 60)
    list.push({
      type: 'warning',
      msg: `Title is too long (${tLen} chars). Google may truncate it.`,
    });
  else
    list.push({
      type: 'success',
      msg: `Title length is perfect (${tLen} chars)`,
    });

  // Description
  const dLen = props.data.description.length;
  if (!dLen) list.push({ type: 'error', msg: 'Missing Meta Description' });
  else if (dLen < 110)
    list.push({
      type: 'warning',
      msg: `Description is too short (${dLen} chars). Aim for 120-160.`,
    });
  else if (dLen > 160)
    list.push({
      type: 'warning',
      msg: `Description is too long (${dLen} chars). Google may truncate it.`,
    });
  else list.push({ type: 'success', msg: 'Description length is optimal' });

  // OG
  if (!props.data.ogImage) list.push({ type: 'error', msg: 'Missing Open Graph Image (og:image)' });
  else list.push({ type: 'success', msg: 'Open Graph Image is present' });

  // Twitter
  if (!props.data.twitterCard)
    list.push({
      type: 'warning',
      msg: 'Missing twitter:card type (summary_large_image recommended)',
    });

  // Robots
  if (!props.data.robots)
    list.push({
      type: 'warning',
      msg: 'No meta robots tag found (defaults to index,follow)',
    });

  return list;
});
</script>

<template>
  <div class="space-y-2">
    <div
      v-for="(check, idx) in checks"
      :key="idx"
      class="flex items-center gap-3 p-3 rounded-lg border text-sm"
      :class="{
        'bg-red-900/10 border-red-900/30': check.type === 'error',
        'bg-yellow-900/10 border-yellow-900/30': check.type === 'warning',
        'bg-green-900/10 border-green-900/30': check.type === 'success',
      }"
    >
      <div
        class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
        :class="{
          'bg-red-500/20 text-red-400': check.type === 'error',
          'bg-yellow-500/20 text-yellow-400': check.type === 'warning',
          'bg-green-500/20 text-green-400': check.type === 'success',
        }"
      >
        <UIcon
          :name="
            check.type === 'success'
              ? 'Check'
              : check.type === 'error'
                ? 'XMark'
                : 'ExclamationTriangle'
          "
          class="w-4 h-4"
        />
      </div>
      <span
        :class="{
          'text-red-200': check.type === 'error',
          'text-yellow-200': check.type === 'warning',
          'text-green-200': check.type === 'success',
        }"
      >
        {{ check.msg }}
      </span>
    </div>
  </div>
</template>

