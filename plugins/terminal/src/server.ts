import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const runningProcesses = new Map<string, ReturnType<typeof spawn>>();

  rpc.handle('term:list', async () => {
    const pkgPath = path.resolve(ctx.root, 'package.json');
    try {
      const content = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);
      return Object.keys(pkg.scripts || {});
    } catch {
      return [];
    }
  });

  rpc.handle('term:run', async (payload: unknown) => {
    const { scriptName, id } = payload as { scriptName: string; id: string };

    // Останавливаем предыдущий процесс с таким же id, если есть
    const existing = runningProcesses.get(id);
    if (existing) {
      existing.kill();
      runningProcesses.delete(id);
    }

    const child = spawn('npm', ['run', scriptName], {
      cwd: ctx.root,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    runningProcesses.set(id, child);

    child.stdout?.on('data', (data: Buffer) => {
      rpc.broadcast('term:log', {
        id,
        type: 'stdout',
        data: data.toString(),
      });
    });

    child.stderr?.on('data', (data: Buffer) => {
      rpc.broadcast('term:log', {
        id,
        type: 'stderr',
        data: data.toString(),
      });
    });

    child.on('close', (code) => {
      runningProcesses.delete(id);
      rpc.broadcast('term:close', {
        id,
        code: code ?? 0,
      });
    });

    child.on('error', (error) => {
      runningProcesses.delete(id);
      rpc.broadcast('term:error', {
        id,
        error: error.message,
      });
    });

    return { id, pid: child.pid };
  });

  rpc.handle('term:kill', async (payload: unknown) => {
    const { id } = payload as { id: string };
    const process = runningProcesses.get(id);
    if (process) {
      process.kill();
      runningProcesses.delete(id);
      return true;
    }
    return false;
  });
}

