---
to: <%= projectName %>/src/client.tsx
---
import type { PluginClientInstance, ClientApi } from '@u-devtools/core';
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

// React Component
const ReactPanel = ({ api }: { api: ClientApi }) => {
  const [count, setCount] = useState(0);
  const [serverData, setServerData] = useState('');

  const callServer = async () => {
    try {
      const res = await api.rpc.call<string>('<%= pluginKebab %>:hello');
      setServerData(res);
      api.notify('Hello from React!', 'success');
    } catch (e) {
      api.notify('RPC call failed', 'error');
    }
  };

  return (
    <div className="p-6 text-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded bg-[#61dafb] flex items-center justify-center text-black font-bold">
          R
        </div>
        <h1 className="text-2xl font-bold"><%= pluginName %></h1>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <h3 className="font-bold text-[#61dafb] mb-2">Interactive Counter</h3>
          <div className="flex gap-2 items-center">
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
              onClick={() => setCount((c) => c - 1)}
            >
              -
            </button>
            <span className="font-mono text-xl w-8 text-center">{count}</span>
            <button
              className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition"
              onClick={() => setCount((c) => c + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <h3 className="font-bold text-green-400 mb-2">Server RPC</h3>
          <button
            className="px-4 py-2 bg-[#61dafb]/20 text-[#61dafb] border border-[#61dafb]/50 rounded hover:bg-[#61dafb]/30 transition"
            onClick={callServer}
          >
            Call Node.js
          </button>
          {serverData && (
            <div className="mt-2 p-2 bg-black/30 rounded font-mono text-sm">
              Server: {serverData}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const plugin: PluginClientInstance = {
  name: '<%= pluginName %>',
  icon: 'CodeBracket',

  renderMain(container, api) {
    const root = createRoot(container);
    root.render(<ReactPanel api={api} />);

    return () => {
      root.unmount();
    };
  },
};

export default plugin;

