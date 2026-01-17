<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { ViteRpcClient } from '@u-devtools/bridge';
import { UButton, UInput, ULoading, UIcon, USelect, UBadge, UPluginLayout } from '@u-devtools/ui';

const targetUrl = ref('ws://localhost:5173/__u-devtools-ws');
const mode = ref<'idle' | 'broadcast' | 'view'>('idle');
const status = ref('');
const stats = ref({ fps: 0, bytes: 0 }); // Статистика

// Настройки Viewer
const qualityOptions = [
  { label: 'Low (Fast)', value: 'low' },
  { label: 'Medium (Balanced)', value: 'med' },
  { label: 'High (Sharp)', value: 'high' },
];
const currentQuality = ref('med');

// --- BROADCAST LOGIC ---
const startBroadcast = () => {
  mode.value = 'broadcast';
  const targetWindow = window.top || window;
  targetWindow.dispatchEvent(new CustomEvent('u-devtools:remote-start', { 
    detail: { url: targetUrl.value } 
  }));
};

const stopBroadcast = () => {
  mode.value = 'idle';
  const targetWindow = window.top || window;
  targetWindow.dispatchEvent(new CustomEvent('u-devtools:remote-stop'));
};

// --- VIEWER LOGIC ---
let viewerRpc: ViteRpcClient | null = null;
const frameSrc = ref('');
const imageRef = ref<HTMLImageElement | null>(null);
const textInput = ref('');
let frameCount = 0;
let lastFrameTime = Date.now();

// Обновление конфига на хосте
const updateConfig = (q: string) => {
  if (!viewerRpc) return;
  let config = { quality: 0.6, scale: 0.5 };
  
  if (q === 'low') config = { quality: 0.3, scale: 0.4 };
  if (q === 'high') config = { quality: 0.8, scale: 0.8 };
  
  viewerRpc.call('stream:input', { type: 'config', ...config });
};

const startViewer = async () => {
  mode.value = 'view';
  status.value = 'Connecting...';
  
  try {
    viewerRpc = new ViteRpcClient(undefined, targetUrl.value);
    
    viewerRpc.on('stream:frame', (data: any) => {
      if (data.image) {
        frameSrc.value = data.image;
        stats.value.bytes = data.image.length;
        
        // Расчет FPS
        frameCount++;
        const now = Date.now();
        if (now - lastFrameTime > 1000) {
          stats.value.fps = frameCount;
          frameCount = 0;
          lastFrameTime = now;
        }
        
        if (status.value !== 'Live') status.value = 'Live';
      }
    });
    
    // Инициализация конфига при старте
    setTimeout(() => updateConfig(currentQuality.value), 500);
    
  } catch (e) {
    status.value = 'Error: ' + String(e);
  }
};

const stopViewer = () => {
  mode.value = 'idle';
  if (viewerRpc) viewerRpc.dispose();
  viewerRpc = null;
  frameSrc.value = '';
};

// Throttle функция для mousemove
let lastMoveTime = 0;
const throttleDelay = 50; // 50ms

const sendMove = (x: number, y: number) => {
  const now = Date.now();
  if (now - lastMoveTime >= throttleDelay) {
    lastMoveTime = now;
    if (viewerRpc) viewerRpc.call('stream:input', { type: 'mousemove', x, y });
  }
};

// Interaction

// 1. Mouse Move with Throttle
const handleMouseMove = (e: MouseEvent) => {
  if (!imageRef.value || !viewerRpc) return;
  const rect = imageRef.value.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  sendMove(x, y);
};

// 2. Click
const handleInteraction = (e: MouseEvent) => {
  if (!imageRef.value || !viewerRpc) return;
  const rect = imageRef.value.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;
  viewerRpc.call('stream:input', { type: 'click', x, y });
};

// 3. Scroll
const handleWheel = (e: WheelEvent) => {
  if (!viewerRpc) return;
  viewerRpc.call('stream:input', { type: 'scroll', dx: e.deltaX, dy: e.deltaY });
};

const sendText = () => {
  if (!viewerRpc || !textInput.value) return;
  viewerRpc.call('stream:input', { type: 'type', text: textInput.value });
  textInput.value = '';
};

onUnmounted(() => {
  if (mode.value === 'broadcast') stopBroadcast();
  if (mode.value === 'view') stopViewer();
});
</script>

<template>
  <UPluginLayout title="Remote Control" icon="ComputerDesktop">
    <template #toolbar-left>
      <div class="flex items-center gap-2">
        <div class="h-4 w-px bg-gray-700"></div>
        <UInput v-model="targetUrl" placeholder="WS URL" class="w-64" :disabled="mode !== 'idle'" size="sm" />
      </div>
    </template>
    
    <template #actions>
      <template v-if="mode === 'idle'">
        <UButton variant="primary" icon="Signal" size="sm" @click="startBroadcast">Share</UButton>
        <UButton variant="secondary" icon="Eye" size="sm" @click="startViewer">View</UButton>
      </template>
      
      <template v-else>
        <div v-if="mode === 'view'" class="flex items-center gap-2">
          <UBadge :color="stats.fps > 5 ? 'green' : 'yellow'" size="sm">{{ stats.fps }} FPS</UBadge>
          <UBadge color="gray" size="sm">{{ (stats.bytes / 1024).toFixed(0) }} KB</UBadge>
          <USelect 
            v-model="currentQuality" 
            :options="qualityOptions" 
            size="sm" 
            class="w-32"
            @update:model-value="updateConfig"
          />
        </div>
        <UButton variant="danger" icon="Stop" size="sm" @click="mode === 'broadcast' ? stopBroadcast() : stopViewer()">
          Stop
        </UButton>
      </template>
    </template>

    <div class="h-full overflow-hidden relative flex items-center justify-center bg-black/50">
      <div v-if="mode === 'idle'" class="text-center text-zinc-500">
        <UIcon name="ComputerDesktop" class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Remote Control Idle</p>
      </div>

      <div v-else-if="mode === 'broadcast'" class="text-center animate-pulse text-red-400">
        <UIcon name="Signal" class="w-12 h-12 mx-auto mb-2" />
        <h2 class="text-xl font-bold">Broadcasting...</h2>
        <p class="text-xs text-zinc-500 mt-2">Page changes are being streamed</p>
      </div>

      <div v-else-if="mode === 'view'" class="w-full h-full flex flex-col">
        <div v-if="!frameSrc" class="flex-1 flex flex-col items-center justify-center text-zinc-400">
          <ULoading text="Waiting for stream..." />
        </div>
        
        <div v-else class="flex-1 relative flex items-center justify-center overflow-hidden bg-zinc-900">
          <img 
            ref="imageRef"
            :src="frameSrc" 
            class="max-w-full max-h-full object-contain cursor-crosshair shadow-2xl"
            @click="handleInteraction"
            @mousemove="handleMouseMove"
            @wheel.prevent="handleWheel"
            draggable="false"
          />
          
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-80 flex gap-2 p-2 bg-black/60 backdrop-blur rounded-lg border border-white/10">
             <UInput v-model="textInput" placeholder="Type to remote..." size="sm" class="bg-transparent border-transparent" @keydown.enter="sendText"/>
             <UButton size="sm" icon="PaperAirplane" variant="ghost" @click="sendText" />
          </div>
        </div>
      </div>
    </div>
  </UPluginLayout>
</template>
