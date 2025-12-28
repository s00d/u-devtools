import { AppBridge } from '@u-devtools/core';

const bridge = new AppBridge('inspector');

// --- OVERLAY SYSTEM ---
const overlayContainer = document.createElement('div');
overlayContainer.id = 'u-devtools-overlay-container';
overlayContainer.style.cssText =
  'position: fixed; top: 0; left: 0; pointer-events: none; z-index: 999999; display: none;';

// Слои для Box Model
const marginBox = createBox('rgba(249, 204, 157, 0.7)'); // Orange
const paddingBox = createBox('rgba(195, 224, 180, 0.7)'); // Green
const contentBox = createBox('rgba(160, 197, 232, 0.7)'); // Blue
const tooltip = createTooltip();

overlayContainer.append(marginBox, paddingBox, contentBox, tooltip);
document.body.appendChild(overlayContainer);

function createBox(color: string) {
  const div = document.createElement('div');
  div.style.cssText = `position: fixed; background: ${color}; transition: all 0.1s; pointer-events: none;`;
  return div;
}

function createTooltip() {
  const div = document.createElement('div');
  div.style.cssText =
    'position: fixed; background: #1f2937; color: white; padding: 6px 10px; border-radius: 4px; font-size: 12px; font-family: ui-monospace, monospace; pointer-events: none; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 1000000; line-height: 1.4;';
  return div;
}

// --- LOGIC ---

let isActive = false;
let currentTarget: HTMLElement | null = null;

// Стратегии определения компонента (модульная система резолверов)
interface ComponentInfo {
  framework: 'Vue' | 'React' | 'Svelte';
  name: string;
  file: string;
  line?: number;
}

type ComponentResolver = (el: HTMLElement) => ComponentInfo | null;

const componentResolvers: ComponentResolver[] = [
  // Vue 3 Strategy
  (el: HTMLElement) => {
    const vueInstance = (el as any).__vueParentComponent;
    if (vueInstance) {
      const vnode = vueInstance.vnode;
      if (vnode?.type && (vnode.type as any).__file) {
        return {
          framework: 'Vue',
          name: (vnode.type as any).name || (vnode.type as any).__name || 'Anonymous',
          file: (vnode.type as any).__file,
          line: (vnode.type as any).__line || 1,
        };
      }
    }
    return null;
  },

  // React Strategy
  (el: HTMLElement) => {
    const reactKey = Object.keys(el).find(
      (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
    );
    if (reactKey) {
      const fiber = (el as any)[reactKey];
      if (fiber?._debugSource) {
        return {
          framework: 'React',
          name: fiber.elementType?.name || 'Anonymous',
          file: fiber._debugSource.fileName,
          line: fiber._debugSource.lineNumber,
        };
      }
      // Try alternative React detection
      if (fiber?.elementType?.name) {
        return {
          framework: 'React',
          name: fiber.elementType.name,
          file: 'Unknown',
          line: 1,
        };
      }
    }
    return null;
  },

  // Svelte Strategy
  (el: HTMLElement) => {
    if ((el as any).__svelte_meta) {
      const meta = (el as any).__svelte_meta;
      return {
        framework: 'Svelte',
        name: 'SvelteComponent',
        file: meta.loc?.file || 'Unknown',
        line: meta.loc?.line || 1,
      };
    }
    return null;
  },
];

function getComponentSource(el: HTMLElement): ComponentInfo | null {
  for (const resolve of componentResolvers) {
    const result = resolve(el);
    if (result) return result;
  }
  return null;
}

function highlight(el: HTMLElement) {
  currentTarget = el;
  overlayContainer.style.display = 'block';

  const rect = el.getBoundingClientRect();
  const styles = window.getComputedStyle(el);

  // Parse Box Model
  const mt = parseFloat(styles.marginTop) || 0;
  const mb = parseFloat(styles.marginBottom) || 0;
  const ml = parseFloat(styles.marginLeft) || 0;
  const mr = parseFloat(styles.marginRight) || 0;

  const pt = parseFloat(styles.paddingTop) || 0;
  const pb = parseFloat(styles.paddingBottom) || 0;
  const pl = parseFloat(styles.paddingLeft) || 0;
  const pr = parseFloat(styles.paddingRight) || 0;

  // Margin Box
  setPos(marginBox, rect.x - ml, rect.y - mt, rect.width + ml + mr, rect.height + mt + mb);
  // Padding Box (Border Box actually)
  setPos(paddingBox, rect.x, rect.y, rect.width, rect.height);
  // Content Box
  setPos(contentBox, rect.x + pl, rect.y + pt, rect.width - pl - pr, rect.height - pt - pb);

  // Tooltip
  const idStr = el.id ? `<span style="color: #fbbf24">#${el.id}</span>` : '';
  const classStr =
    el.classList.length > 0
      ? `<span style="color: #6ee7b7">${Array.from(el.classList)
          .map((c) => '.' + c)
          .join('')}</span>`
      : '';
  tooltip.innerHTML = `
    <span style="color: #a5b4fc">${el.tagName.toLowerCase()}</span>
    ${idStr}
    ${classStr}
    <span style="opacity: 0.6; margin-left: 8px">${Math.round(rect.width)} × ${Math.round(rect.height)}</span>
  `;

  // Tooltip positioning (smart flip)
  const tooltipY = rect.top - 40 < 0 ? rect.bottom + 10 : rect.top - 40;
  tooltip.style.top = `${tooltipY + window.scrollY}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
}

function setPos(el: HTMLElement, x: number, y: number, w: number, h: number) {
  el.style.left = `${x + window.scrollX}px`;
  el.style.top = `${y + window.scrollY}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
}

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
    boxSizing: s.boxSizing,
    width: s.width,
    height: s.height,
    border: s.border,
  };
}

// Navigation helpers
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

const onMouseOver = (e: MouseEvent) => {
  if (!isActive) return;
  e.stopPropagation();
  e.preventDefault();
  highlight(e.target as HTMLElement);
};

const onClick = (e: MouseEvent) => {
  if (!isActive) return;
  e.stopPropagation();
  e.preventDefault();

  const el = e.target as HTMLElement;
  const rect = el.getBoundingClientRect();

  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    attrs[attr.name] = attr.value;
  }

  const data = {
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList),
    attrs,
    innerText: el.innerText.slice(0, 100),
    rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    computed: getComputedStylesData(el),
    component: getComponentSource(el),
    breadcrumbs: getBreadcrumbs(el),
  };

  bridge.send('element-picked', data);
  toggleInspector(false);
};

function toggleInspector(state: boolean) {
  isActive = state;
  overlayContainer.style.display = isActive ? 'block' : 'none';
  if (!isActive) {
    marginBox.style.width = '0';
    paddingBox.style.width = '0';
    contentBox.style.width = '0';
    tooltip.style.display = 'none';
  } else {
    tooltip.style.display = 'block';
  }
  document.body.style.cursor = isActive ? 'crosshair' : '';
}

bridge.on<{ state: boolean }>('toggle-inspector', (data) => {
  toggleInspector(data.state);
});

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isActive) {
    toggleInspector(false);
    bridge.send('inspector-cancelled', {});
  }
};

document.addEventListener('mouseover', onMouseOver, true);
document.addEventListener('click', onClick, true);
document.addEventListener('keydown', onKeyDown);

// --- CLEANUP (ВАЖНО!) ---
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    // Удаляем элементы из DOM
    const overlay = document.getElementById('u-devtools-overlay-container');
    if (overlay) overlay.remove();

    // Удаляем слушатели
    document.removeEventListener('mouseover', onMouseOver, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown);
    
    // Закрываем канал
    bridge.close();
  });
}
