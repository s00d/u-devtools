import type { RpcServerInterface, ServerContext } from '@u-devtools/core';

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  // Кадры: Жертва -> Сервер -> ВСЕ
  rpc.handle('stream:frame', (payload) => {
    rpc.broadcast('stream:frame', payload);
    return { ok: true };
  });

  // Ввод: Админ -> Сервер -> ВСЕ
  rpc.handle('stream:input', (payload) => {
    rpc.broadcast('stream:input', payload);
    return { ok: true };
  });
}
