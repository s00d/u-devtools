import { ref, type Ref } from 'vue';

export type ResizeDirection = 'horizontal' | 'vertical';

export interface UseResizableOptions {
  /**
   * Направление ресайза
   * @default 'vertical'
   */
  direction?: ResizeDirection;
  /**
   * Callback при начале ресайза
   */
  onResizeStart?: () => void;
  /**
   * Callback при окончании ресайза
   */
  onResizeEnd?: () => void;
  /**
   * Минимальное значение (может быть функцией для динамического вычисления)
   */
  min?: number | (() => number);
  /**
   * Максимальное значение (может быть функцией для динамического вычисления)
   */
  max?: number | (() => number);
}

/**
 * Универсальный composable для ресайза элементов.
 * Поддерживает как вертикальный (height), так и горизонтальный (width) ресайз.
 */
export function useResizable(sizeRef: Ref<number>, options: UseResizableOptions = {}) {
  const { direction = 'vertical', onResizeStart, onResizeEnd, min, max } = options;

  const isResizing = ref(false);
  let startPos = 0;
  let startSize = 0;
  let currentPointerId: number | null = null;

  const getClientPos = (e: PointerEvent): number => {
    return direction === 'vertical' ? e.clientY : e.clientX;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isResizing.value || currentPointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();

    const currentPos = getClientPos(e);
    const delta =
      direction === 'vertical'
        ? startPos - currentPos // Для вертикального: вверх = увеличение
        : currentPos - startPos; // Для горизонтального: вправо = увеличение

    let newSize = startSize + delta;

    // Применяем ограничения
    if (min !== undefined) {
      const minValue = typeof min === 'function' ? min() : min;
      newSize = Math.max(minValue, newSize);
    }
    if (max !== undefined) {
      const maxValue = typeof max === 'function' ? max() : max;
      newSize = Math.min(maxValue, newSize);
    }

    sizeRef.value = newSize;
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isResizing.value || currentPointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    isResizing.value = false;
    currentPointerId = null;

    window.removeEventListener('pointermove', onPointerMove, true);
    window.removeEventListener('pointerup', onPointerUp, true);
    window.removeEventListener('pointercancel', onPointerUp, true);

    document.body.style.userSelect = '';
    document.body.style.pointerEvents = '';

    onResizeEnd?.();
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    isResizing.value = true;
    currentPointerId = e.pointerId;
    startPos = getClientPos(e);
    startSize = sizeRef.value;

    // Захватываем указатель для надежного отслеживания
    if (e.currentTarget instanceof HTMLElement && e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    window.addEventListener('pointermove', onPointerMove, true);
    window.addEventListener('pointerup', onPointerUp, true);
    window.addEventListener('pointercancel', onPointerUp, true);

    // Блокируем выделение текста и iframe события
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';

    onResizeStart?.();
  };

  return {
    isResizing,
    onPointerDown,
  };
}
