/**
 * Protocol definition for remote-control plugin
 * Symmetric protocol: both sides can broadcast or view
 */
export interface RemoteControlProtocol {
  // --- СЕТЕВОЙ ТРАФИК (Обмен между хостами) ---
  
  // Кадр от Жертвы к Админу (через rpc.call)
  'stream:frame': (payload: { image: string; w: number; h: number }) => { ok: boolean };
  
  // Ввод от Админа к Жертве (через rpc.call)
  'stream:input': (payload: { 
    type: 'click' | 'type' | 'scroll' | 'config' | 'mousemove';
    x?: number; y?: number; // 0..1
    dx?: number; dy?: number;
    text?: string;
    // Настройки
    quality?: number; // 0.1 - 1.0
    scale?: number;   // 0.1 - 1.0
  }) => { ok: boolean };
}
