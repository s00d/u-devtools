<script setup lang="ts">
import { ref } from 'vue';
import { UCard, UButton, UInput, UTextarea } from '@u-devtools/ui';

const formData = ref({
  name: '',
  email: '',
  message: '',
});

const handleSubmit = () => {
  console.log('Form submitted:', formData.value);
  // Reset form
  formData.value = {
    name: '',
    email: '',
    message: '',
  };
};
</script>

<template>
  <div class="space-y-6">
    <UCard title="Forms">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold mb-2">Name</label>
          <UInput v-model="formData.name" placeholder="Enter your name" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2">Email</label>
          <UInput v-model="formData.email" type="email" placeholder="Enter your email" />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-2">Message</label>
          <UTextarea
            v-model="formData.message"
            placeholder="Enter your message"
            :rows="4"
          />
        </div>

        <div class="flex gap-2">
          <UButton type="submit" label="Submit" />
          <UButton
            type="button"
            label="Reset"
            variant="ghost"
            @click="formData = { name: '', email: '', message: '' }"
          />
        </div>
      </form>
    </UCard>
  </div>
</template>

