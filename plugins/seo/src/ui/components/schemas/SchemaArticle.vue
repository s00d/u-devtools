<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ data: any }>();

const date = computed(() => {
  if (!props.data.datePublished) return null;
  return new Date(props.data.datePublished).toLocaleDateString();
});

const author = computed(() => {
  if (typeof props.data.author === 'string') return props.data.author;
  return props.data.author?.name;
});

const image = computed(() => {
  if (typeof props.data.image === 'string') return props.data.image;
  if (Array.isArray(props.data.image)) return props.data.image[0];
  return props.data.image?.url;
});
</script>

<template>
  <div class="font-sans max-w-[600px] flex gap-4 bg-white p-4 rounded border border-gray-200">
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-1">
        <div class="flex flex-col">
          <span class="text-sm text-[#202124]">{{ props.data.publisher?.name || 'Publisher' }}</span>
        </div>
      </div>
      <div class="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-tight">
        {{ data.headline || data.name || 'No Headline' }}
      </div>
      <div class="text-sm text-[#4d5156] line-clamp-2 mb-1">
        <span v-if="date" class="text-[#70757a] mr-1">{{ date }} — </span>
        {{ data.description || 'No description.' }}
      </div>
      <div class="text-xs text-[#70757a] mt-1" v-if="author">
        By {{ author }}
      </div>
    </div>
    <div v-if="image" class="w-28 h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
      <img :src="image" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

