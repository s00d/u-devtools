import { AppBridge, registerMenuItem, devtools } from '@u-devtools/core';

const bridge = new AppBridge('inspector');

// --- OVERLAY SYSTEM ---
// Создаем контейнер в Shadow DOM, чтобы стили сайта не влияли на оверлей
const overlayHost = document.createElement('div');
overlayHost.id = 'u-devtools-inspector-host';
overlayHost.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 2147483645 !important; display: none;';
document.documentElement.appendChild(overlayHost);

const shadow = overlayHost.attachShadow({ mode: 'closed' });

// Стили внутри Shadow DOM
const style = document.createElement('style');
style.textContent = `
  .box { position: fixed; pointer-events: none; transition: all 0.1s cubic-bezier(0.25, 0.8, 0.25, 1); will-change: width, height, transform; }
  .margin { background: rgba(249, 204, 157, 0.6); border: 1px dashed rgba(249, 204, 157, 0.9); }
  .padding { background: rgba(195, 224, 180, 0.6); }
  .content { background: rgba(160, 197, 232, 0.6); }
  
  .close-button {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    background: #18181b;
    border: 1px solid #3f3f46;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 1001;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  
  .close-button:hover {
    background: #27272a;
    border-color: #52525b;
    transform: scale(1.05);
  }
  
  .close-button:active {
    transform: scale(0.95);
  }
  
  .close-button svg {
    width: 20px;
    height: 20px;
    stroke: #f4f4f5;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
  }
  
  .tooltip {
    position: fixed;
    background: #18181b;
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    line-height: 1.4;
    border: 1px solid #3f3f46;
  }
  .tag { color: #a5b4fc; font-weight: bold; }
  .id { color: #fbbf24; }
  .class { color: #6ee7b7; }
  .dims { opacity: 0.6; margin-left: 8px; font-size: 11px; }
`;
shadow.appendChild(style);

// --- VISUAL GUIDES SYSTEM ---
// Создаем 4 линии (верх, низ, лево, право) и метки
const guidesHost = document.createElement('div');
guidesHost.id = 'u-devtools-guides-host';
guidesHost.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1000; display: none;';
document.documentElement.appendChild(guidesHost);

function createLine(vertical: boolean) {
  const el = document.createElement('div');
  el.style.cssText = `position: absolute; background: rgba(244, 63, 94, 0.5); ${vertical ? 'width: 1px; height: 100vh;' : 'height: 1px; width: 100vw;'} display: none;`;
  return el;
}
const guideTop = createLine(false);
const guideBottom = createLine(false);
const guideLeft = createLine(true);
const guideRight = createLine(true);
guidesHost.append(guideTop, guideBottom, guideLeft, guideRight);

// Создаем элементы оверлея
const marginBox = document.createElement('div'); marginBox.className = 'box margin';
const paddingBox = document.createElement('div'); paddingBox.className = 'box padding';
const contentBox = document.createElement('div'); contentBox.className = 'box content';
const tooltip = document.createElement('div'); tooltip.className = 'tooltip';

// Кнопка закрытия инспектора
const closeButton = document.createElement('button');
closeButton.className = 'close-button';
closeButton.style.display = 'none';
closeButton.innerHTML = `
  <svg viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
`;
closeButton.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  toggleInspector(false);
  bridge.send('inspector-cancelled', {});
  // Отменяем ожидание выбора элемента, если оно было
  if (elementSelectionRejector) {
    elementSelectionRejector();
    elementSelectionResolver = null;
    elementSelectionRejector = null;
  }
});

shadow.append(marginBox, paddingBox, contentBox, tooltip, closeButton);

// --- STATE ---

let isActive = false;
let currentTarget: HTMLElement | null = null;
const UDT_ID_ATTR = 'data-udt-id'; // Уникальный ID для надежной связи

// --- COMPONENT RESOLVERS --- (removed - framework detection not needed)

function getComputedStylesData(el: HTMLElement) {
  const s = window.getComputedStyle(el);
  return {
    display: s.display,
    position: s.position,
    fontFamily: s.fontFamily,
    fontSize: s.fontSize,
    color: s.color,
    backgroundColor: s.backgroundColor,
    margin: s.margin,
    padding: s.padding,
    width: s.width,
    height: s.height,
    boxSizing: s.boxSizing,
    border: s.border,
    // Box Model values
    marginTop: s.marginTop,
    marginBottom: s.marginBottom,
    marginLeft: s.marginLeft,
    marginRight: s.marginRight,
    paddingTop: s.paddingTop,
    paddingBottom: s.paddingBottom,
    paddingLeft: s.paddingLeft,
    paddingRight: s.paddingRight,
    borderTopWidth: s.borderTopWidth,
    borderBottomWidth: s.borderBottomWidth,
    borderLeftWidth: s.borderLeftWidth,
    borderRightWidth: s.borderRightWidth,
  };
}

function getStylesByCategory(el: HTMLElement) {
  const s = window.getComputedStyle(el);
  
  // Группируем стили для удобства
  return {
    layout: {
      display: s.display,
      position: s.position,
      top: s.top, 
      right: s.right, 
      bottom: s.bottom, 
      left: s.left,
      width: s.width,
      height: s.height,
      margin: s.margin,
      padding: s.padding,
      'box-sizing': s.boxSizing,
      'z-index': s.zIndex
    },
    text: {
      color: s.color,
      'font-size': s.fontSize,
      'font-family': s.fontFamily,
      'font-weight': s.fontWeight,
      'line-height': s.lineHeight,
      'text-align': s.textAlign
    },
    appearance: {
      background: s.background,
      'background-color': s.backgroundColor,
      border: s.border,
      'border-radius': s.borderRadius,
      opacity: s.opacity,
      cursor: s.cursor,
      visibility: s.visibility
    },
    flex: s.display.includes('flex') ? {
      'flex-direction': s.flexDirection,
      'justify-content': s.justifyContent,
      'align-items': s.alignItems,
      gap: s.gap
    } : null
  };
}

// Получение A11y данных
function getA11yData(el: HTMLElement) {
  return {
    role: el.getAttribute('role') || el.tagName.toLowerCase(),
    tabIndex: el.tabIndex,
    ariaLabel: el.getAttribute('aria-label') || '',
    ariaHidden: el.getAttribute('aria-hidden') || '',
    title: el.title || '',
    alt: el.getAttribute('alt') || '',
  };
}


// Проверяем и открываем DevTools если нужно (не блокируем выполнение)
function ensureDevToolsOpen() {
  devtools.isOpen().then((isOpen) => {
    if (!isOpen) {
      devtools.open();
    }
  });
}

// --- HELPERS ---

// Генерируем ID для элемента, если его нет
function ensureUdtId(el: HTMLElement): string {
  if (!el.hasAttribute(UDT_ID_ATTR)) {
    el.setAttribute(UDT_ID_ATTR, Math.random().toString(36).slice(2));
  }
  const id = el.getAttribute(UDT_ID_ATTR);
  if (!id) {
    // Fallback на случай, если что-то пошло не так
    const fallbackId = Math.random().toString(36).slice(2);
    el.setAttribute(UDT_ID_ATTR, fallbackId);
    return fallbackId;
  }
  return id;
}

// Находим элемент по ID
function getElementByUdtId(id: string): HTMLElement | null {
  return document.querySelector(`[${UDT_ID_ATTR}="${id}"]`);
}

// Promise для ожидания выбора элемента
let elementSelectionResolver: ((element: HTMLElement) => void) | null = null;
let elementSelectionRejector: (() => void) | null = null;

function sendElementData(el: HTMLElement) {
  // Проверяем и открываем DevTools если нужно
  ensureDevToolsOpen();
  
  // Отправляем данные элемента
  sendElementDataInternal(el);
}

function sendElementDataInternal(el: HTMLElement) {
  const udtId = ensureUdtId(el);
  const rect = el.getBoundingClientRect();
  
  const attrs: Record<string, string> = {};
  Array.from(el.attributes).forEach(attr => {
    if (attr.name !== UDT_ID_ATTR) { // Скрываем наш служебный атрибут
      attrs[attr.name] = attr.value;
    }
  });

  const data = {
    udtId, // Важно: отправляем ID
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList),
    attrs,
    innerText: el.innerText.substring(0, 500),
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    styles: getStylesByCategory(el),
    computed: getComputedStylesData(el), // Нужно для Box Model значений
    breadcrumbs: getBreadcrumbs(el),
    a11y: getA11yData(el),
    colors: getContrast(el),
    domContext: getDomContext(el)
  };

  bridge.send('element-picked', data);
}

function getBreadcrumbs(el: HTMLElement) {
  const path: Array<{ tagName: string; id: string; class: string }> = [];
  let curr: HTMLElement | null = el;
  while (curr && curr.tagName !== 'HTML') {
    path.unshift({
      tagName: curr.tagName.toLowerCase(),
      id: curr.id || '',
      class: Array.from(curr.classList).join('.'),
    });
    curr = curr.parentElement;
  }
  return path;
}

// Хелпер для краткого описания узла
function serializeNodeSummary(el: Element) {
  return {
    id: (el as HTMLElement).id || '',
    tagName: el.tagName.toLowerCase(),
    classes: Array.from(el.classList),
    hasChildren: el.children.length > 0
  };
}

// Хелпер для сбора контекста DOM (Родитель + Соседи + Дети)
function getDomContext(el: HTMLElement) {
  const parent = el.parentElement;
  
  // Фильтруем DevTools элементы из соседей
  const allSiblings = parent ? Array.from(parent.children) : [el];
  const validSiblings = allSiblings.filter(child => !isDevToolsElement(child as HTMLElement));
  
  // Соседи (братья и сестры) с индексами (только валидные элементы)
  const siblings = validSiblings.map((child, index) => ({
    ...serializeNodeSummary(child),
    isCurrent: child === el,
    index // Индекс в отфильтрованном массиве
  }));

  // Дети текущего элемента с индексами (только валидные элементы)
  const validChildren = Array.from(el.children).filter(child => !isDevToolsElement(child as HTMLElement));
  const children = validChildren.map((child, index) => ({
    ...serializeNodeSummary(child),
    index
  }));

  // Находим валидного родителя (пропускаем DevTools элементы)
  let validParent = parent;
  while (validParent && isDevToolsElement(validParent)) {
    validParent = validParent.parentElement;
  }

  return {
    parent: validParent ? serializeNodeSummary(validParent) : null,
    siblings,
    children
  };
}

// --- COLOR UTILS ---
function rgbToHex(rgb: string): string {
  if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#000000';
  const res = rgb.match(/\d+/g);
  if (!res || res.length < 3) return rgb;
  const r = parseInt(res[0]);
  const g = parseInt(res[1]);
  const b = parseInt(res[2]);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function getContrast(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  const color = style.color;
  const bg = style.backgroundColor;
  return { 
    color: rgbToHex(color), 
    bg: rgbToHex(bg),
    colorRaw: color,
    bgRaw: bg
  };
}

// --- LOGIC ---

function updateOverlay(el: HTMLElement) {
  if (!el || !isActive) return;
  
  const rect = el.getBoundingClientRect();
  const styles = window.getComputedStyle(el);

  // Parse Box Model (values in px)
  const mt = parseFloat(styles.marginTop) || 0;
  const mb = parseFloat(styles.marginBottom) || 0;
  const ml = parseFloat(styles.marginLeft) || 0;
  const mr = parseFloat(styles.marginRight) || 0;

  const pt = parseFloat(styles.paddingTop) || 0;
  const pb = parseFloat(styles.paddingBottom) || 0;
  const pl = parseFloat(styles.paddingLeft) || 0;
  const pr = parseFloat(styles.paddingRight) || 0;
  
  const bt = parseFloat(styles.borderTopWidth) || 0;
  const bb = parseFloat(styles.borderBottomWidth) || 0;
  const bl = parseFloat(styles.borderLeftWidth) || 0;
  const br = parseFloat(styles.borderRightWidth) || 0;

  // Margin Box (Outer most)
  // top = rect.top - margin-top
  setPos(marginBox, rect.left - ml, rect.top - mt, rect.width + ml + mr, rect.height + mt + mb);

  // Padding Box (Inside border)
  // top = rect.top + border-top
  setPos(paddingBox, rect.left + bl, rect.top + bt, rect.width - bl - br, rect.height - bt - bb);
  
  // Content Box (Inside padding)
  // top = rect.top + border-top + padding-top
  setPos(contentBox, rect.left + bl + pl, rect.top + bt + pt, rect.width - bl - br - pl - pr, rect.height - bt - bb - pt - pb);

  // Tooltip
  const idStr = el.id ? `<span class="id">#${el.id}</span>` : '';
  let classStr = '';
  if (el.classList.length > 0) {
    const classes = Array.from(el.classList).join('.');
    classStr = `<span class="class">.${classes.length > 20 ? classes.slice(0, 20) + '...' : classes}</span>`;
  }
  
  tooltip.innerHTML = `
    <span class="tag">${el.tagName.toLowerCase()}</span>
    ${idStr}
    ${classStr}
    <span class="dims">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>
  `;

  // Smart Tooltip Positioning
  // Пытаемся разместить сверху, если не влезает - снизу
  const tooltipHeight = 30; 
  let tooltipTop = rect.top - mt - tooltipHeight - 5;
  if (tooltipTop < 0) {
    tooltipTop = rect.bottom + mb + 5;
  }
  
  tooltip.style.transform = `translate(${rect.left}px, ${tooltipTop}px)`;
  
  // RULERS UPDATE
  guidesHost.style.display = isActive ? 'block' : 'none';
  
  // Рисуем линии от краев элемента до краев экрана
  // Top Line
  guideTop.style.transform = `translateY(${rect.top}px)`;
  guideTop.style.display = 'block';
  
  // Bottom Line
  guideBottom.style.transform = `translateY(${rect.bottom}px)`;
  guideBottom.style.display = 'block';
  
  // Left Line
  guideLeft.style.transform = `translateX(${rect.left}px)`;
  guideLeft.style.display = 'block';
  
  // Right Line
  guideRight.style.transform = `translateX(${rect.right}px)`;
  guideRight.style.display = 'block';
}

function setPos(el: HTMLElement, x: number, y: number, w: number, h: number) {
  // Используем transform для производительности (не вызывает layout thrashing)
  el.style.transform = `translate(${x}px, ${y}px)`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
}

// --- EVENT HANDLERS ---

// Проверка, является ли элемент частью DevTools
function isDevToolsElement(el: HTMLElement | null): boolean {
  if (!el) return false;
  // Проверяем, находится ли элемент внутри контейнера DevTools
  const devtoolsContainer = document.getElementById('udt-container');
  if (devtoolsContainer?.contains(el)) {
    return true;
  }
  // Проверяем, является ли элемент самим контейнером или его дочерними элементами
  if (el.id === 'udt-container' || el.closest('#udt-container')) {
    return true;
  }
  // Проверяем overlay элементы
  if (el.id === 'u-devtools-inspector-host' || el.id === 'u-devtools-guides-host') {
    return true;
  }
  // Проверяем shadow DOM элементы
  if (el.getRootNode() === shadow) {
    return true;
  }
  return false;
}

const onMouseOver = (e: MouseEvent) => {
  if (!isActive) return;
  // Игнорируем сам оверлей (хотя pointer-events: none спасает, но на всякий)
  if (e.target === overlayHost) return;
  
  const target = e.target as HTMLElement;
  
  // Игнорируем элементы DevTools
  if (isDevToolsElement(target)) {
    return;
  }
  
  e.stopPropagation();
  e.preventDefault();
  
  if (target !== currentTarget) {
    currentTarget = target;
    updateOverlay(target);
  }
};

const onClick = (e: MouseEvent) => {
  if (!isActive) return;
  
  const target = e.target as HTMLElement;
  
  // Игнорируем элементы DevTools
  if (isDevToolsElement(target)) {
    return;
  }
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation(); // Блокируем клики на странице полностью

  // При клике сохраняем ссылку на текущий элемент
  currentTarget = target;
  
  // Если есть ожидающий resolver, передаем элемент через Promise
  // Данные будут отправлены в обработчике onClick в registerMenuItem
  if (elementSelectionResolver) {
    const resolver = elementSelectionResolver;
    elementSelectionResolver = null;
    elementSelectionRejector = null;
    
    toggleInspector(false);
    bridge.send('inspector-cancelled', {}); // Уведомляем UI о завершении
    
    // Передаем элемент через resolver
    resolver(target);
    return; // Выходим, данные будут отправлены в обработчике
  }
  
  // Если нет ожидающего resolver, это обычный режим - отправляем данные сразу
  sendElementData(target);
  toggleInspector(false);
  bridge.send('inspector-cancelled', {}); // Уведомляем UI о завершении
};

// Scroll listener to update overlay position
const onScroll = () => {
  if (isActive && currentTarget) {
    updateOverlay(currentTarget);
  }
};

// --- CONTROL ---

function toggleInspector(state: boolean): Promise<HTMLElement> | undefined {
  if (state) {
    // Активируем режим инспектирования
    isActive = true;
    overlayHost.style.display = 'block';
    guidesHost.style.display = 'block';
    closeButton.style.display = 'flex'; // Показываем кнопку закрытия
    document.addEventListener('mouseover', onMouseOver, true); // true = capture phase
    document.addEventListener('click', onClick, true);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    document.body.style.cursor = 'crosshair';
    
    // Возвращаем Promise, который разрешится при выборе элемента
    return new Promise<HTMLElement>((resolve, reject) => {
      elementSelectionResolver = resolve;
      elementSelectionRejector = reject;
    });
  } else {
    // Деактивируем режим инспектирования
    isActive = false;
    overlayHost.style.display = 'none';
    guidesHost.style.display = 'none';
    closeButton.style.display = 'none'; // Скрываем кнопку закрытия
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('scroll', onScroll, true);
    document.body.style.cursor = '';
    currentTarget = null;
    // Скрываем направляющие
    guideTop.style.display = 'none';
    guideBottom.style.display = 'none';
    guideLeft.style.display = 'none';
    guideRight.style.display = 'none';
    
    // Отменяем ожидание выбора элемента, если оно было
    if (elementSelectionRejector) {
      elementSelectionRejector();
      elementSelectionResolver = null;
      elementSelectionRejector = null;
    }
    
    return undefined;
  }
}

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isActive) {
    toggleInspector(false);
    bridge.send('inspector-cancelled', {});
    // Отменяем ожидание выбора элемента
    if (elementSelectionRejector) {
      elementSelectionRejector();
      elementSelectionResolver = null;
      elementSelectionRejector = null;
    }
  }
};

// Commands from UI
bridge.on('toggle-inspector', async (data: { state: boolean }) => {
  const result = toggleInspector(data.state);
  
  // Если активировали режим инспектирования, ждем выбора элемента
  if (data.state && result) {
    try {
      const element = await result;
      // Отправляем данные выбранного элемента
      sendElementData(element);
    } catch {
      // Пользователь отменил выбор (например, нажал Escape)
      // Ничего не делаем
    }
  }
});

// --- ACTIONS HANDLERS ---

// Хелпер для выполнения действия и обновления UI
function mutate(udtId: string | undefined, action: (el: HTMLElement) => void) {
  // Если ID не передан, используем currentTarget (фолбэк)
  const el = udtId ? getElementByUdtId(udtId) : currentTarget;
  
  if (!el) {
    console.warn('[Inspector] Target element not found for mutation');
    return;
  }

  try {
    action(el);
    // После изменения обновляем данные в UI и перерисовываем оверлей
    sendElementData(el);
    if (el === currentTarget) {
      updateOverlay(el);
    }
  } catch (e) {
    console.error('[Inspector] Mutation failed:', e);
  }
}

bridge.on('highlight', () => {
  if (currentTarget) {
    // Включаем подсветку уже выбранного элемента (без режима выбора)
    overlayHost.style.display = 'block';
    guidesHost.style.display = 'block';
    updateOverlay(currentTarget);
    // Скрываем через 2 сек
    setTimeout(() => { 
      if(!isActive) {
        overlayHost.style.display = 'none';
        guidesHost.style.display = 'none';
      }
    }, 2000);
  }
});

// 1. Атрибуты
bridge.on('update-attr', ({ udtId, name, value }: { udtId?: string, name: string, value: string }) => {
  mutate(udtId, (el) => el.setAttribute(name, value));
});

bridge.on('remove-attr', ({ udtId, name }: { udtId?: string, name: string }) => {
  mutate(udtId, (el) => el.removeAttribute(name));
});

bridge.on('update-text', ({ udtId, text }: { udtId?: string, text: string }) => {
  mutate(udtId, (el) => {
    el.innerText = text;
  });
});

bridge.on('delete-node', ({ udtId }: { udtId?: string }) => {
  const el = udtId ? getElementByUdtId(udtId) : currentTarget;
  if (!el) return;
  
  const parent = el.parentElement;
  el.remove();
  
  // Если удалили текущий, переключаемся на родителя
  if (parent) {
    currentTarget = parent;
    sendElementData(parent);
    updateOverlay(parent);
  } else {
    overlayHost.style.display = 'none';
  }
});

bridge.on('scroll-into-view', ({ udtId }: { udtId?: string }) => {
  mutate(udtId, (el) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Visual Flash
    const originalOutline = el.style.outline;
    el.style.outline = '2px solid #f43f5e';
    setTimeout(() => { el.style.outline = originalOutline; }, 1500);
  });
});

bridge.on('log-node', ({ udtId }: { udtId?: string }) => {
  const el = udtId ? getElementByUdtId(udtId) : currentTarget;
  if (!el) return;
  console.log('%c [U-DevTools] Selected Element:', 'color: #6366f1; font-weight: bold;', el);
  // Делаем доступным как $0 (стандарт хрома, но мы эмулируем)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).$0 = el;
  console.log('Available as window.$0');
});

// --- CLASS MANAGEMENT ---

// Добавить класс
bridge.on('add-class', ({ udtId, cls }: { udtId?: string, cls: string }) => {
  mutate(udtId, (el) => el.classList.add(...cls.split(' ').filter(Boolean)));
});

// Удалить класс
bridge.on('remove-class', ({ udtId, cls }: { udtId?: string, cls: string }) => {
  mutate(udtId, (el) => el.classList.remove(cls));
});

// Тоггл класса (вкл/выкл)
bridge.on('toggle-class', ({ udtId, cls, active }: { udtId?: string, cls: string, active: boolean }) => {
  mutate(udtId, (el) => {
    if (active) {
      el.classList.add(cls);
    } else {
      el.classList.remove(cls);
    }
  });
});

// Обновление всего списка классов (для TailwindEditor)
bridge.on('update-classes', ({ udtId, classes }: { udtId?: string, classes: string[] }) => {
  mutate(udtId, (el) => {
    el.className = classes.join(' ');
  });
});

// Изменение стиля (для Box Model)
bridge.on('update-style', ({ udtId, prop, value }: { udtId?: string, prop: string, value: string }) => {
  mutate(udtId, (el) => {
    // Используем type assertion для доступа к динамическим свойствам стиля
    (el.style as unknown as Record<string, string>)[prop] = value;
  });
});

// Новая команда: Скролл + Мигание (Focus)
bridge.on('focus-node', ({ udtId }: { udtId?: string }) => {
  const el = udtId ? getElementByUdtId(udtId) : currentTarget;
  if (!el) return;
  
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Пытаемся сфокусировать элемент, если он фокусируемый
  if (el instanceof HTMLElement && 
      (el instanceof HTMLInputElement || 
       el instanceof HTMLButtonElement || 
       el instanceof HTMLAnchorElement ||
       el.tabIndex >= 0)) {
    try {
      el.focus();
    } catch {
      // Игнорируем ошибки фокусировки
    }
  }
  
  // Визуальный эффект
  const originalOutline = el.style.outline;
  const originalOutlineOffset = el.style.outlineOffset;
  el.style.outline = '2px solid #f43f5e';
  el.style.outlineOffset = '2px';
  setTimeout(() => {
    if (el) {
      el.style.outline = originalOutline;
      el.style.outlineOffset = originalOutlineOffset;
    }
  }, 1500);
});

// Новая команда: Toggle Visibility (Visibility hidden vs Display none)
bridge.on('toggle-visibility', ({ udtId, mode }: { udtId?: string, mode: 'hide' | 'remove' }) => {
  mutate(udtId, (el) => {
    if (mode === 'hide') {
      el.style.visibility = el.style.visibility === 'hidden' ? '' : 'hidden';
    } else {
      el.style.display = el.style.display === 'none' ? '' : 'none';
    }
  });
});

// Функция для поиска элемента по его характеристикам
function findElementBySelector(tagName: string, id: string, classesStr: string): HTMLElement | null {
  // Преобразуем строку классов обратно в массив
  const classes = classesStr ? classesStr.split(' ').filter(c => c.trim()) : [];
  
  // Сначала пробуем найти по ID (самый надежный способ)
  if (id) {
    const byId = document.getElementById(id);
    if (byId && byId.tagName.toLowerCase() === tagName.toLowerCase() && !isDevToolsElement(byId)) {
      return byId;
    }
  }
  
  // Пробуем найти по селектору (tag + id + classes)
  let selector = tagName.toLowerCase();
  if (id) {
    selector += `#${id}`;
  }
  if (classes.length > 0) {
    selector += '.' + classes.join('.');
  }
  
  try {
    const elements = document.querySelectorAll(selector);
    for (const el of Array.from(elements)) {
      if (el instanceof HTMLElement && !isDevToolsElement(el)) {
        // Проверяем, что классы совпадают
        const elClasses = Array.from(el.classList).sort();
        const targetClasses = [...classes].sort();
        if (elClasses.length === targetClasses.length && 
            elClasses.every((c, i) => c === targetClasses[i])) {
          return el;
        }
      }
    }
  } catch {
    // Игнорируем ошибки селектора
  }
  
  return null;
}

// Добавляем команду навигации по дереву (выбор соседа/родителя из UI)
bridge.on('select-node', (payload: { 
  type: 'parent' | 'sibling' | 'child', 
  index?: number,
  // Добавляем информацию о текущем элементе для поиска (classes как строка для сериализации)
  currentElement?: { tagName: string; id: string; classes: string }
}) => {
  // Если currentTarget не установлен, пытаемся найти элемент по переданным характеристикам
  let baseElement = currentTarget;
  
  if (!baseElement && payload.currentElement) {
    baseElement = findElementBySelector(
      payload.currentElement.tagName,
      payload.currentElement.id,
      payload.currentElement.classes || ''
    );
  }
  
  if (!baseElement) {
    console.warn('[Inspector] select-node: cannot find base element, currentTarget is null and no currentElement provided');
    return;
  }
  
  let target: Element | null = null;
  
  if (payload.type === 'parent') {
    target = baseElement.parentElement;
    // Игнорируем DevTools элементы
    while (target && isDevToolsElement(target as HTMLElement)) {
      target = target.parentElement;
    }
  } else if (payload.type === 'sibling' && baseElement.parentElement) {
    // Выбираем соседа по индексу
    if (typeof payload.index === 'number') {
      const siblings = Array.from(baseElement.parentElement.children).filter(
        child => !isDevToolsElement(child as HTMLElement)
      );
      target = siblings[payload.index] || null;
    }
  } else if (payload.type === 'child') {
    // Выбираем ребенка по индексу
    if (typeof payload.index === 'number') {
      const children = Array.from(baseElement.children).filter(
        child => !isDevToolsElement(child as HTMLElement)
      );
      target = children[payload.index] || null;
    }
  }

  if (target && target instanceof HTMLElement && !isDevToolsElement(target)) {
    currentTarget = target;
    // Проверяем и открываем DevTools если нужно
    ensureDevToolsOpen();
    sendElementData(currentTarget);
    // Показываем overlay даже если режим инспектирования выключен
    overlayHost.style.display = 'block';
    guidesHost.style.display = 'block';
    updateOverlay(currentTarget);
    // Скроллим к элементу, чтобы не потерять контекст
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Автоматически скрываем подсветку через 2 секунды после выбора (если режим инспектирования выключен)
    setTimeout(() => {
      if (!isActive) {
        overlayHost.style.display = 'none';
        guidesHost.style.display = 'none';
      }
    }, 2000);
  } else {
    console.warn('[Inspector] select-node: target not found or invalid', { type: payload.type, index: payload.index });
  }
});

// Cleanup
interface ImportMetaHot {
  dispose?: (callback: () => void) => void;
}
const hot = (import.meta as unknown as { hot?: ImportMetaHot }).hot;
if (hot?.dispose) {
  hot.dispose(() => {
    overlayHost.remove();
    guidesHost.remove();
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('click', onClick, true);
    window.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('keydown', onKeyDown);
    document.body.style.cursor = '';
    bridge.close();
  });
}

// Add keyboard listener
document.addEventListener('keydown', onKeyDown);

// Регистрируем кнопку в меню лаунчера
registerMenuItem({
  id: 'inspector-pick',
  label: 'Inspect Element',
  icon: 'MagnifyingGlass',
  order: 10,
  onClick: async (ctx, _event) => {
    // Активируем режим инспектирования и ждем выбора элемента
    const elementPromise = toggleInspector(true);
    
    if (!elementPromise) {
      return; // Не должно произойти, но на всякий случай
    }
    
    try {
      // Ждем выбора элемента
      const element = await elementPromise;
      
      // После получения элемента открываем DevTools и переключаем таб
      if (!ctx.isOpen) {
        // Если DevTools закрыт, открываем и ждем
        ctx.open();
        await new Promise<void>((resolve) => {
          const unsubscribe = devtools.onStateChange((isOpen) => {
            if (isOpen) {
              unsubscribe();
              resolve();
            }
          });
        });
      }
      
      // Переключаем на плагин и таб
      devtools.switchPlugin('Inspector');
      devtools.switchTab('Inspector', 'Computed');
      
      // Небольшая задержка для гарантии, что переключение произошло
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Отправляем данные элемента
      sendElementDataInternal(element);
    } catch {
      // Пользователь отменил выбор (например, нажал Escape)
      // Ничего не делаем
    }
  }
});
