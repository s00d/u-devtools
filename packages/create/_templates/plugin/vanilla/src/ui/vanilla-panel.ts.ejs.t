---
to: <%= projectName %>/src/ui/vanilla-panel.ts
---
import type { ClientApi } from '@u-devtools/core';

<%
  const pluginKebab = packageName
    .replace(/^@[^/]+\//, '')
    .replace(/^plugin-/, '')
    .replace(/@u-devtools\/plugin-/, '');
-%>

export function createVanillaPanel(container: HTMLElement, api: ClientApi) {
  let count = 0;
  let serverResponse = '';

  // Создаем DOM структуру
  const root = document.createElement('div');
  root.className = 'p-6 text-gray-200';

  // Header
  const header = document.createElement('div');
  header.className = 'flex items-center gap-3 mb-6';

  const icon = document.createElement('div');
  icon.className = 'w-10 h-10 rounded bg-[#f59e0b] flex items-center justify-center text-black font-bold';
  icon.textContent = 'JS';

  const title = document.createElement('h1');
  title.className = 'text-2xl font-bold';
  title.textContent = '<%= pluginName %>';

  header.appendChild(icon);
  header.appendChild(title);
  root.appendChild(header);

  // Counter section
  const counterSection = document.createElement('div');
  counterSection.className = 'p-4 bg-gray-800 rounded border border-gray-700 mb-4';

  const counterTitle = document.createElement('h3');
  counterTitle.className = 'font-bold text-[#f59e0b] mb-2';
  counterTitle.textContent = 'Interactive Counter';

  const counterControls = document.createElement('div');
  counterControls.className = 'flex gap-2 items-center';

  const decrementBtn = document.createElement('button');
  decrementBtn.className = 'px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition';
  decrementBtn.textContent = '-';

  const countDisplay = document.createElement('span');
  countDisplay.className = 'font-mono text-xl w-8 text-center';
  countDisplay.textContent = '0';

  const incrementBtn = document.createElement('button');
  incrementBtn.className = 'px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition';
  incrementBtn.textContent = '+';

  const updateCount = () => {
    countDisplay.textContent = String(count);
  };

  decrementBtn.addEventListener('click', () => {
    count--;
    updateCount();
  });

  incrementBtn.addEventListener('click', () => {
    count++;
    updateCount();
  });

  counterControls.appendChild(decrementBtn);
  counterControls.appendChild(countDisplay);
  counterControls.appendChild(incrementBtn);

  counterSection.appendChild(counterTitle);
  counterSection.appendChild(counterControls);
  root.appendChild(counterSection);

  // RPC section
  const rpcSection = document.createElement('div');
  rpcSection.className = 'p-4 bg-gray-800 rounded border border-gray-700';

  const rpcTitle = document.createElement('h3');
  rpcTitle.className = 'font-bold text-green-400 mb-2';
  rpcTitle.textContent = 'Server RPC';

  const rpcButton = document.createElement('button');
  rpcButton.className = 'px-4 py-2 bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50 rounded hover:bg-[#f59e0b]/30 transition';
  rpcButton.textContent = 'Call Node.js';

  const responseDiv = document.createElement('div');
  responseDiv.className = 'mt-2 p-2 bg-black/30 rounded font-mono text-sm hidden';

  rpcButton.addEventListener('click', async () => {
    try {
      serverResponse = await api.rpc.call<string>('<%= pluginKebab %>:hello');
      responseDiv.textContent = `Server: ${serverResponse}`;
      responseDiv.classList.remove('hidden');
      api.notify('Hello from Vanilla JS!', 'success');
    } catch (e) {
      api.notify('RPC call failed', 'error');
    }
  });

  rpcSection.appendChild(rpcTitle);
  rpcSection.appendChild(rpcButton);
  rpcSection.appendChild(responseDiv);
  root.appendChild(rpcSection);

  container.appendChild(root);

  // Cleanup function
  return () => {
    root.remove();
  };
}

