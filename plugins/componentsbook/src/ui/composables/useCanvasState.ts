import { reactive } from 'vue';
import type { CanvasSettings } from '../../types';

export function useCanvasState() {
  const settings = reactive<CanvasSettings>({
    zoom: 1,
    background: 'grid',
    viewport: {
      width: '100%',
      height: '100%',
      name: 'responsive',
      rotate: false,
    },
  });

  const setViewport = (name: string) => {
    settings.viewport.name = name as CanvasSettings['viewport']['name'];
    settings.viewport.rotate = false;
    
    switch (name) {
      case 'mobile':
        settings.viewport.width = '375px';
        settings.viewport.height = '667px';
        break;
      case 'tablet':
        settings.viewport.width = '768px';
        settings.viewport.height = '1024px';
        break;
      case 'desktop':
        settings.viewport.width = '1280px';
        settings.viewport.height = '800px';
        break;
      case 'responsive':
      default:
        settings.viewport.width = '100%';
        settings.viewport.height = '100%';
        break;
    }
  };

  const toggleRotate = () => {
    if (settings.viewport.name === 'responsive') return;
    settings.viewport.rotate = !settings.viewport.rotate;
    // Swap width/height
    const temp = settings.viewport.width;
    settings.viewport.width = settings.viewport.height;
    settings.viewport.height = temp;
  };

  const zoomIn = () => {
    if (settings.zoom < 3) settings.zoom += 0.1;
  };
  
  const zoomOut = () => {
    if (settings.zoom > 0.2) settings.zoom -= 0.1;
  };
  
  const resetZoom = () => {
    settings.zoom = 1;
  };

  return {
    settings,
    setViewport,
    toggleRotate,
    zoomIn,
    zoomOut,
    resetZoom,
  };
}
