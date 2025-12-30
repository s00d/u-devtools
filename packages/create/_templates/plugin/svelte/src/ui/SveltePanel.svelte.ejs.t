---
to: <%= projectName %>/src/ui/SveltePanel.svelte
---
<script lang="ts">
  import type { ClientApi } from '@u-devtools/core';
  
  // Svelte 5: используем $props() вместо export let
  const { api } = $props<{ api: ClientApi }>();

  // Svelte 5: используем $state() для реактивных переменных
  let count = $state(0);
  let serverResponse = $state('');

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

  function increment() {
    count += 1;
  }

  async function callServer() {
    try {
      serverResponse = await api.rpc.call('<%= pluginKebab %>:hello');
      api.notify('Svelte calling server success!', 'success');
    } catch (e) {
      api.notify('Error', 'error');
    }
  }
</script>

<div class="p-6 text-gray-200">
  <div class="flex items-center gap-3 mb-6">
    <div class="w-10 h-10 rounded bg-[#ff3e00] flex items-center justify-center text-white font-bold">
      Sv
    </div>
    <h1 class="text-2xl font-bold"><%= pluginName %></h1>
  </div>

  <div class="space-y-4">
    <div class="p-4 bg-gray-800 rounded border border-gray-700">
      <h3 class="font-bold text-[#ff3e00] mb-2">Reactivity</h3>
      <button 
        class="px-4 py-2 bg-[#ff3e00] text-white rounded hover:bg-[#ff3e00]/80 transition"
        onclick={increment}
      >
        Count is {count}
      </button>
    </div>

    <div class="p-4 bg-gray-800 rounded border border-gray-700">
      <h3 class="font-bold text-gray-400 mb-2">API Interaction</h3>
      <button 
        class="text-sm underline text-gray-400 hover:text-white"
        onclick={callServer}
      >
        Test RPC Call
      </button>
      {#if serverResponse}
        <div class="mt-2 font-mono text-green-400">
          &gt; {serverResponse}
        </div>
      {/if}
    </div>
  </div>
</div>

