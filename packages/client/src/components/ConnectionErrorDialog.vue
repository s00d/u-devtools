<script setup lang="ts">
import { ref } from 'vue';
import { useDevToolsState } from '../composables/useDevToolsState';
import { RPC_URL_KEY } from '../modules/clientApi';
import { UButton, UIcon, ULoading } from '@u-devtools/ui';

const { connectionError } = useDevToolsState();
const isRetrying = ref(false);
const isResetting = ref(false); // Add loader for reset

const retry = () => {
  isRetrying.value = true;
  window.location.reload();
};

const resetConnection = async () => {
  isResetting.value = true;

  try {
    // 1. Clear localStorage (Browser memory)
    localStorage.removeItem(RPC_URL_KEY);
    
    // 2. Clear Electron config (File memory)
    // IMPORTANT: Use electronAPI directly, as RPC (WebSocket) is dead!
    const electron = (window as any).electronAPI;
    
    if (electron?.saveConfig) {
      console.log('[Dialog] Clearing Electron config via IPC...');
      // Overwrite customRpcUrl with empty string
      await electron.saveConfig({ customRpcUrl: '' });
    } else {
      console.warn('[Dialog] Electron API not found, skipping file config clear');
    }
  } catch (e) {
    console.error('[Dialog] Reset failed:', e);
  } finally {
    // 3. Reload in any case
    window.location.reload();
  }
};
</script>

<template>
  <div
    v-if="connectionError.failed"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease-out]"
  >
    <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
      
      <!-- Header -->
      <div class="bg-zinc-900 p-6 flex flex-col items-center text-center gap-4 border-b border-zinc-800">
        <div class="relative">
          <div class="p-4 bg-red-500/10 rounded-full border border-red-500/20">
            <UIcon name="SignalSlash" class="w-10 h-10 text-red-500" />
          </div>
          <!-- Pulse animation behind icon -->
          <div class="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75"></div>
        </div>
        
        <div>
          <h2 class="text-xl font-bold text-white mb-2">Connection Lost</h2>
          <p class="text-zinc-400 text-sm break-all">
             Attempted to connect to:
             <br>
             <span class="text-yellow-500 font-mono text-xs">{{ connectionError.url }}</span>
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="p-6 bg-zinc-900/50 flex flex-col gap-3">
        <UButton 
          variant="primary" 
          size="lg"
          class="w-full justify-center"
          :disabled="isRetrying || isResetting"
          @click="retry"
        >
          <template v-if="isRetrying">
            <ULoading size="sm" class="mr-2" /> Connecting...
          </template>
          <template v-else>
            <UIcon name="ArrowPath" class="w-4 h-4 mr-2" /> Retry Connection
          </template>
        </UButton>

        <UButton 
          variant="ghost" 
          size="md"
          class="w-full justify-center text-red-400 hover:bg-red-500/10 hover:text-red-300"
          :disabled="isRetrying || isResetting"
          @click="resetConnection"
        >
          <template v-if="isResetting">
            <ULoading size="sm" class="mr-2" /> Resetting...
          </template>
          <template v-else>
            <UIcon name="Trash" class="w-4 h-4 mr-2" />
            Reset Settings & Autodetect
          </template>
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
</style>
