<script setup lang="ts">
import { computed } from 'vue';
import { UIcon } from '@u-devtools/ui';

const props = defineProps<{ data: any }>();

const price = computed(() => {
  const offer = Array.isArray(props.data.offers) ? props.data.offers[0] : props.data.offers;
  if (!offer) return null;
  return `${offer.priceCurrency || ''} ${offer.price || ''}`;
});

const rating = computed(() => props.data.aggregateRating?.ratingValue);
const reviewCount = computed(() => props.data.aggregateRating?.reviewCount);
const inStock = computed(() => {
  const offer = Array.isArray(props.data.offers) ? props.data.offers[0] : props.data.offers;
  return offer?.availability?.includes('InStock');
});
</script>

<template>
  <div class="font-sans max-w-[600px] bg-white p-4 rounded border border-gray-200 text-[#4d5156]">
    <!-- Breadcrumb-like url (fake) -->
    <div class="text-xs text-[#202124] mb-1 truncate">example.com › products › {{ data.sku || 'item' }}</div>
    
    <!-- Title -->
    <div class="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mb-1 font-medium">
      {{ data.name || 'No Product Name' }}
    </div>

    <!-- Rating & Meta -->
    <div class="flex items-center gap-2 text-sm mb-1">
      <div v-if="rating" class="flex items-center text-[#e8eaed]">
        <div class="flex text-[#fbbc04]">
          <UIcon v-for="i in 5" :key="i" name="Star" :solid="i <= Math.round(Number(rating))" class="w-3.5 h-3.5" />
        </div>
        <span class="text-[#202124] ml-1">{{ rating }}</span>
        <span class="ml-1 text-[#70757a]">({{ reviewCount }})</span>
      </div>
      
      <span v-if="price" class="font-bold text-[#202124]">{{ price }}</span>
      <span v-if="inStock" class="text-[#188038]">In stock</span>
    </div>

    <!-- Description -->
    <div class="text-sm line-clamp-2">
      {{ data.description || 'No description provided.' }}
    </div>
    
    <!-- Image Preview (Thumbnail style) -->
    <div v-if="data.image" class="mt-3 flex gap-2 overflow-hidden">
      <img 
        v-for="(img, idx) in (Array.isArray(data.image) ? data.image : [data.image]).slice(0, 3)" 
        :key="idx"
        :src="img" 
        class="w-20 h-20 object-contain border border-gray-100 rounded"
      />
    </div>
  </div>
</template>

