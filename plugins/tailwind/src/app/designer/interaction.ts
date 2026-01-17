/**
 * Drag & Drop Interaction Handlers
 * Implements spacing drag handles for padding/margin adjustment
 */

// Note: selectedElement and selectionRect should be passed as parameters
// or accessed via composable in the future
import { findClosestSize } from '../../utils/matcher';
import type { TailwindConfigSummary } from '../../types';
import { useBridge } from '../../context';

let isDragging = false;
let dragHandle: 'right' | 'bottom' | 'top' | 'left' | null = null;
let startPosition = { x: 0, y: 0 };
let startValue = 0;
let currentProperty: 'padding' | 'margin' | null = null;
let currentSide: 'top' | 'right' | 'bottom' | 'left' | null = null;
let config: TailwindConfigSummary | null = null;

export function setConfig(cfg: TailwindConfigSummary) {
  config = cfg;
}

export function createDragHandles(
  overlayRoot: ShadowRoot,
  selectedElement: HTMLElement | null,
  selectionRect: DOMRect | null
) {
  if (!selectedElement || !selectionRect) return;

  // Remove existing handles
  const existing = overlayRoot.querySelectorAll('.udt-spacing-handle');
  existing.forEach((el) => {
    el.remove();
  });

  const rect = selectionRect;

  // Create handles for each side
  const sides: Array<{ side: 'top' | 'right' | 'bottom' | 'left'; x: number; y: number; cursor: string }> = [
    { side: 'top', x: rect.left + rect.width / 2, y: rect.top, cursor: 'ns-resize' },
    { side: 'right', x: rect.left + rect.width, y: rect.top + rect.height / 2, cursor: 'ew-resize' },
    { side: 'bottom', x: rect.left + rect.width / 2, y: rect.top + rect.height, cursor: 'ns-resize' },
    { side: 'left', x: rect.left, y: rect.top + rect.height / 2, cursor: 'ew-resize' },
  ];

  sides.forEach(({ side, x, y, cursor }) => {
    const handle = document.createElement('div');
    handle.className = 'udt-spacing-handle udt-handle';
    handle.style.cssText = `
      position: fixed;
      width: 8px;
      height: 8px;
      background-color: #6366f1;
      border: 1px solid #ffffff;
      border-radius: 50%;
      transform: translate(${x - 4}px, ${y - 4}px);
      cursor: ${cursor};
      pointer-events: auto;
      z-index: 10002;
    `;
    handle.title = `Drag to adjust ${side} ${currentProperty || 'padding'}`;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startDrag(side, e, selectedElement);
    });

    overlayRoot.appendChild(handle);
  });
}

function startDrag(
  side: 'top' | 'right' | 'bottom' | 'left',
  e: MouseEvent,
  selectedElement: HTMLElement
) {
  if (!selectedElement) return;

  isDragging = true;
  dragHandle = side;
  startPosition = { x: e.clientX, y: e.clientY };

  const styles = window.getComputedStyle(selectedElement);
  currentProperty = 'padding'; // Default to padding, can be toggled

  // Get current value for the side
  const propertyMap: Record<string, string> = {
    top: `${currentProperty}Top`,
    right: `${currentProperty}Right`,
    bottom: `${currentProperty}Bottom`,
    left: `${currentProperty}Left`,
  };

  const property = propertyMap[side];
  const value = styles.getPropertyValue(property);
  startValue = parseFloat(value) || 0;
  currentSide = side;

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd, { once: true });

  // Prevent text selection during drag
  document.body.style.userSelect = 'none';
}

let currentSelectedElement: HTMLElement | null = null;

function onDragMove(e: MouseEvent) {
  if (!isDragging || !currentSelectedElement || !dragHandle || !currentSide) return;

  let delta = 0;
  if (dragHandle === 'right' || dragHandle === 'left') {
    delta = e.clientX - startPosition.x;
  } else {
    delta = e.clientY - startPosition.y;
  }

  // Invert for top and left
  if (dragHandle === 'top' || dragHandle === 'left') {
    delta = -delta;
  }

  const newPx = Math.max(0, startValue + delta);

  // Apply inline style for live preview
  const property = `${currentProperty}${currentSide.charAt(0).toUpperCase() + currentSide.slice(1)}` as
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'marginTop'
    | 'marginRight'
    | 'marginBottom'
    | 'marginLeft';

  currentSelectedElement.style[property] = `${newPx}px`;
}

function onDragEnd() {
  if (!currentSelectedElement || !currentSide || !currentProperty) return;

  isDragging = false;
  document.body.style.userSelect = '';

  const styles = window.getComputedStyle(currentSelectedElement);
  const property = `${currentProperty}${currentSide.charAt(0).toUpperCase() + currentSide.slice(1)}` as
    | 'paddingTop'
    | 'paddingRight'
    | 'paddingBottom'
    | 'paddingLeft';

  const currentPx = parseFloat(styles.getPropertyValue(property));

  // Find closest Tailwind class
  if (config?.theme?.spacing) {
    const prefix = currentProperty === 'padding' ? 'p' : 'm';
    const sidePrefix = currentSide === 'top' ? 't' : currentSide === 'right' ? 'r' : currentSide === 'bottom' ? 'b' : 'l';
    const fullPrefix = `${prefix}${sidePrefix}`;

    const closestClass = findClosestSize(`${currentPx}px`, config.theme.spacing, fullPrefix);

    // Remove inline style
    currentSelectedElement.style[property] = '';

    // Apply Tailwind class via bridge
    if (currentSelectedElement) {
      // Получаем bridge из контекста
      const bridge = useBridge();
      
      const udtId = currentSelectedElement.getAttribute('data-udt-id') || '';
      const currentClasses = Array.from(currentSelectedElement.classList);
      
      // Remove old spacing classes for this side
      const spacingRegex = new RegExp(`^${fullPrefix}-`);
      const filteredClasses = currentClasses.filter((c) => !spacingRegex.test(c));
      
      // Add new class
      if (closestClass && !closestClass.startsWith('[')) {
        // Only add if it's a valid Tailwind class (not arbitrary value)
        filteredClasses.push(closestClass);
      }
      
      // Update element classes
      currentSelectedElement.className = filteredClasses.join(' ');
      
      // Send to bridge to sync with panel
      bridge.send('update-classes', {
        udtId: String(udtId),
        classes: filteredClasses.map(String), // Ensure all items are strings
      });
    }
  }

  dragHandle = null;
  currentSide = null;
  currentProperty = null;
  currentSelectedElement = null;

  window.removeEventListener('mousemove', onDragMove);
}

export function cleanupHandles(overlayRoot: ShadowRoot) {
  const handles = overlayRoot.querySelectorAll('.udt-spacing-handle');
  handles.forEach((el) => {
    el.remove();
  });
}

