import { ref, onMounted } from 'vue';
import { useBridge } from '../context';
import type { VueInspectorProtocol } from '../types';

export interface VueApp {
  id: string;
  name: string;
  version: string;
}

/**
 * Composable for managing Vue applications
 */
export function useVueApps() {
  const bridge = useBridge();
  const apps = ref<VueApp[]>([]);
  const selectedAppId = ref<string>('');

  const getAppsList = () => {
    try {
      bridge.send('inspector:getAppsList');
    } catch (e) {
      // Ignore if bridge is closed
    }
  };

  const switchApp = (appId: string) => {
    try {
      selectedAppId.value = appId;
      bridge.send('inspector:switchApp', { appId });
    } catch (e) {
      // Ignore if bridge is closed
    }
  };

  // Слушаем список приложений
  bridge.on('inspector:appsList', (appsList: VueApp[]) => {
    apps.value = appsList;
    // Если приложение не выбрано, выбираем первое
    if (!selectedAppId.value && appsList.length > 0) {
      selectedAppId.value = appsList[0].id;
    }
  });

  // Слушаем событие готовности после переключения приложения
  bridge.on('inspector:ready', () => {
    // После переключения приложения клиент должен запросить дерево компонентов
    // Это будет сделано через watch в ComponentsTab
  });

  onMounted(() => {
    getAppsList();
  });

  return {
    apps,
    selectedAppId,
    getAppsList,
    switchApp,
  };
}
