import { ref } from 'vue';

export function useResizable(
  heightRef: { value: number },
  onResizeStart?: () => void,
  onResizeEnd?: () => void
) {
  const isResizing = ref(false);
  let startY = 0;
  let startHeight = 0;
  let currentPointerId: number | null = null;

  const onPointerMove = (e: PointerEvent) => {
    if (!isResizing.value || currentPointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const delta = startY - e.clientY;
    heightRef.value = startHeight + delta;
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
    startY = e.clientY;
    startHeight = heightRef.value;

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
