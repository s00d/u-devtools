---
to: <%= projectName %>/src/client.tsx
---
import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

const SolidPanel = (props: { api: ClientApi }) => {
  const [count, setCount] = createSignal(0);
  const [serverData, setServerData] = createSignal('');

  const callServer = async () => {
    try {
      const res = await props.api.rpc.call<string>('<%= pluginKebab %>:hello');
      setServerData(res);
      props.api.notify('Hello from Solid!', 'success');
    } catch (e) {
      props.api.notify('RPC call failed', 'error');
    }
  };

  return (
    <div class="p-6 text-gray-200">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded bg-[#2c4f7c] flex items-center justify-center text-white font-bold border border-[#446b9e]">
          So
        </div>
        <h1 class="text-2xl font-bold"><%= pluginName %></h1>
      </div>

      <div class="space-y-4">
        <div class="p-4 bg-gray-800 rounded border border-gray-700">
          <h3 class="font-bold text-[#446b9e] mb-2">Signal Counter</h3>
          <div class="text-3xl font-mono mb-2">{count()}</div>
          <button
            class="px-3 py-1 bg-[#2c4f7c] rounded hover:bg-[#3d5d8a] transition w-full"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment
          </button>
        </div>

        <div class="p-4 bg-gray-800 rounded border border-gray-700">
          <h3 class="font-bold text-green-400 mb-2">Server RPC</h3>
          <button
            class="px-4 py-2 bg-[#2c4f7c]/20 text-[#446b9e] border border-[#446b9e]/50 rounded hover:bg-[#2c4f7c]/30 transition"
            onClick={callServer}
          >
            Call Node.js
          </button>
          {serverData() && (
            <div class="mt-2 p-2 bg-black/30 rounded font-mono text-sm">
              Server: {serverData()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'CircleStack',

  renderMain(container, api) {
    const dispose = render(() => <SolidPanel api={api} />, container);

    return () => {
      dispose();
    };
  },
};

export default plugin;

