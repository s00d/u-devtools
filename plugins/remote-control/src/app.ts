import { defineApp } from '@u-devtools/kit';
import { toJpeg } from 'html-to-image';
import { ViteRpcClient } from '@u-devtools/bridge';

// --- VISUALS: CURSOR & RIPPLE ---

// Создаем фантомный курсор
function createCursor() {
  const cursor = document.createElement('div');
  cursor.id = 'udt-phantom-cursor';
  // Добавляем transition для плавности (интерполяция движения)
  cursor.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;
    transition: transform 0.1s linear; will-change: transform;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;
  // Красный курсор с подписью
  cursor.innerHTML = `
    <div style="position: relative;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill="#ef4444" stroke="white" stroke-width="1"/>
      </svg>
      <div style="position: absolute; left: 14px; top: 14px; background: #ef4444; color: white; font-size: 10px; padding: 1px 4px; border-radius: 4px; font-family: sans-serif; font-weight: bold; white-space: nowrap;">
        Admin
      </div>
    </div>
  `;
  document.body.appendChild(cursor);
  return cursor;
}

// Эффект волны при клике
function showRipple(x: number, y: number) {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: fixed; top: ${y}px; left: ${x}px;
    width: 20px; height: 20px;
    background: rgba(99, 102, 241, 0.4); border: 2px solid #6366f1;
    border-radius: 50%; transform: translate(-50%, -50%) scale(0.5);
    z-index: 2147483647; pointer-events: none;
    transition: all 0.4s ease-out;
  `;
  document.body.appendChild(ripple);
  
  requestAnimationFrame(() => {
    ripple.style.transform = 'translate(-50%, -50%) scale(2)';
    ripple.style.opacity = '0';
  });
  
  setTimeout(() => ripple.remove(), 400);
}

// --- DOM INTERACTION ---

// "Умный" поиск цели клика
function getClickTarget(x: number, y: number): Element | null {
  // Прячем курсор на мгновение, чтобы не кликнуть в него (хотя pointer-events: none должно хватать)
  const cursor = document.getElementById('udt-phantom-cursor');
  if (cursor) cursor.style.display = 'none';
  
  let el = document.elementFromPoint(x, y);
  
  if (cursor) cursor.style.display = 'block';

  if (!el) return null;

  // Если попали в текстовую ноду или спан, проверяем, не кнопка ли родитель
  // Vue часто вешает @click на button, а внутри span
  const clickableParent = el.closest('button, a, input, [role="button"], [onclick]');
  
  // Если нашли интерактивного родителя, лучше кликнуть в него
  if (clickableParent) {
    return clickableParent;
  }

  return el;
}

function simulateClick(el: Element, x: number, y: number) {
  const opts = {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: x,
    clientY: y,
    buttons: 1
  };

  // Полная цепочка событий
  el.dispatchEvent(new PointerEvent('pointerdown', opts));
  el.dispatchEvent(new MouseEvent('mousedown', opts));
  el.dispatchEvent(new PointerEvent('pointerup', opts));
  el.dispatchEvent(new MouseEvent('mouseup', opts));
  
  // Самое важное для Vue/React
  el.dispatchEvent(new MouseEvent('click', opts));

  // Если это input/textarea - фокусируем
  if (el instanceof HTMLElement) {
    el.focus();
  }
}

// Хелпер для установки значения инпута (React/Vue совместимый)
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export default defineApp({
  setup({ onCleanup }) {
    if (document.querySelector('.udt-overlay-root')) return;

    let rpc: ViteRpcClient | null = null;
    let isRunning = false;
    let isCapturing = false;
    let needsUpdate = true;
    let cursorEl: HTMLElement | null = null;
    
    // Настройки по умолчанию (можно менять с клиента)
    let config = {
      quality: 0.6,
      scale: 0.5, // Уменьшаем размер в 2 раза для скорости
      maxFps: 10,  // Ограничение кадров в секунду
    };

    // --- ОТСЛЕЖИВАНИЕ ИЗМЕНЕНИЙ ---
    const observer = new MutationObserver(() => {
      needsUpdate = true;
    });

    const startObserving = () => {
      observer.observe(document.body, {
        attributes: true, childList: true, subtree: true, characterData: true
      });
      const updateHandler = () => { needsUpdate = true; };
      for (const evt of ['scroll', 'input', 'click']) {
        window.addEventListener(evt, updateHandler, { capture: true });
      }
    };

    const stopObserving = () => {
      observer.disconnect();
    };

    // --- ЗАХВАТ КАДРА ---
    const capture = async () => {
      if (!rpc || isCapturing) return;
      isCapturing = true;

      try {
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;

        // Прячем курсор перед снимком, чтобы он не "запекся" в картинку
        if (cursorEl) cursorEl.style.opacity = '0';

        const dataUrl = await toJpeg(document.body, {
          quality: config.quality,
          canvasWidth: viewW * config.scale,
          canvasHeight: viewH * config.scale,
          width: viewW,
          height: viewH,
          skipAutoScale: true,
          cacheBust: false,
          style: {
            transform: `translate(${-window.scrollX}px, ${-window.scrollY}px)`,
            transformOrigin: 'top left',
            width: `${document.documentElement.scrollWidth}px`,
            height: `${document.documentElement.scrollHeight}px`,
            'pointer-events': 'none',
            'background-color': '#fff'
          } as any,
          filter: (n) => {
            // Фильтруем курсор и оверлей девтулзов
            if (n instanceof Element) {
              if (n.id === 'udt-phantom-cursor') return false;
              if (n.classList?.contains('udt-overlay-root')) return false;
            }
            return true;
          }
        });

        if (cursorEl) cursorEl.style.opacity = '1';

        // Отправляем кадр
        await rpc.call('stream:frame', { 
          image: dataUrl,
          w: viewW,
          h: viewH
        });
        
        needsUpdate = false; // Сбрасываем флаг только после успешной отправки
      } catch (e) {
        console.error('[Remote] Capture error:', e);
      } finally {
        isCapturing = false;
        
        // --- АДАПТИВНЫЙ ЦИКЛ ---
        // Запускаем следующий кадр только если мы все еще работаем
        if (isRunning) {
          // Ограничение FPS (throttle)
          const delay = 1000 / config.maxFps;
          setTimeout(() => {
            // Если были изменения, или прошло много времени (heartbeat)
            if (needsUpdate) {
              requestAnimationFrame(capture);
            } else {
              setTimeout(() => {
                if (isRunning) requestAnimationFrame(capture);
              }, 200); // Heartbeat check
            }
          }, delay);
        }
      }
    };

    // --- ОБРАБОТКА ВХОДЯЩИХ ---
    const handleInput = (p: any) => {
      // 1. Mouse Move (Cursor)
      if (p.type === 'mousemove') {
        const x = p.x * window.innerWidth;
        const y = p.y * window.innerHeight;
        
        if (!cursorEl) cursorEl = createCursor();
        cursorEl.style.transform = `translate(${x}px, ${y}px)`;
        return; // Mouse move не триггерит обновление кадра (экономия)
      }

      // 2. Click
      if (p.type === 'click') {
        const x = p.x * window.innerWidth;
        const y = p.y * window.innerHeight;
        
        // Визуал
        if (!cursorEl) cursorEl = createCursor();
        cursorEl.style.transform = `translate(${x}px, ${y}px)`;
        showRipple(x, y);

        // Логика клика
        const el = getClickTarget(x, y);
        if (el) {
          console.log('[Remote] Clicking:', el.tagName, el.className);
          simulateClick(el, x, y);
        }
        
        needsUpdate = true;
      }
      else if (p.type === 'scroll') {
        window.scrollBy({ left: p.dx, top: p.dy, behavior: 'auto' });
        needsUpdate = true;
      }
      else if (p.type === 'type') {
         const active = document.activeElement;
         if (active && (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) {
           setNativeValue(active, p.text);
           needsUpdate = true;
         }
      }
      else if (p.type === 'config') {
        if (p.quality) config.quality = p.quality;
        if (p.scale) config.scale = p.scale;
        needsUpdate = true;
      }
    };

    // --- СТАРТ / СТОП ---
    const startHandler = async (e: CustomEvent) => {
      if (rpc) rpc.dispose();
      
      try {
        rpc = new ViteRpcClient(undefined, e.detail.url);
        await new Promise(r => setTimeout(r, 100)); // Warmup

        rpc.on('stream:input', handleInput);

        isRunning = true;
        needsUpdate = true;
        startObserving();
        
        console.log('[Remote] 🚀 Started adaptive streaming');
        capture();
      } catch (err) {
        console.error('[Remote] Connection error:', err);
      }
    };

    const stopHandler = () => {
      isRunning = false;
      stopObserving();
      if (cursorEl) cursorEl.remove();
      cursorEl = null;
      if (rpc) rpc.dispose();
      rpc = null;
    };

    const startHandlerWrapper = (e: Event) => {
      // Проверяем через detail, так как instanceof может не работать через iframe границы
      if (e.type === 'u-devtools:remote-start' && 'detail' in e && e.detail) {
        const customEvent = e as CustomEvent<{ url: string }>;
        startHandler(customEvent);
      }
    };

    window.addEventListener('u-devtools:remote-start', startHandlerWrapper);
    window.addEventListener('u-devtools:remote-stop', stopHandler);

    onCleanup(() => {
      stopHandler();
      window.removeEventListener('u-devtools:remote-start', startHandlerWrapper);
      window.removeEventListener('u-devtools:remote-stop', stopHandler);
    });
  },
});
