import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';

// Храним текущую директорию между командами
let currentCwd = '';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  currentCwd = ctx.root;

  rpc.handle('term:execute', async (payload: unknown) => {
    const cmd = payload as string;
    if (!cmd.trim()) return;

    // Обработка смены директории (cd)
    if (cmd.trim().startsWith('cd ')) {
      const target = cmd.trim().substring(3).trim();
      const newPath = path.resolve(currentCwd, target);
      
      // Проверяем существование папки
      try {
        const stat = await fs.stat(newPath);
        if (stat.isDirectory()) {
          currentCwd = newPath;
          rpc.broadcast('term:data', `\n$ ${cmd}\nChanged directory to: ${currentCwd}\n`);
        } else {
          rpc.broadcast('term:data', `\n$ ${cmd}\ncd: ${target}: Not a directory\n`);
        }
      } catch {
        rpc.broadcast('term:data', `\n$ ${cmd}\ncd: ${target}: No such file or directory\n`);
      }
      return;
    }

    // Эхо команды
    rpc.broadcast('term:data', `\n$ ${cmd}\n`);

    try {
      // shell: true позволяет использовать пайпы, редиректы и алиасы ОС
      const child = spawn(cmd, { 
        cwd: currentCwd, 
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      child.stdout?.on('data', (d) => rpc.broadcast('term:data', d.toString()));
      child.stderr?.on('data', (d) => rpc.broadcast('term:data', d.toString()));
      
      child.on('close', (code) => {
        if (code !== null && code !== 0) {
          rpc.broadcast('term:data', `\n[Process exited with code ${code}]\n`);
        }
      });

      child.on('error', (err) => {
        rpc.broadcast('term:data', `Error: ${err.message}\n`);
      });

    } catch (e: any) {
      rpc.broadcast('term:data', `Execution failed: ${e.message}\n`);
    }
  });
}

