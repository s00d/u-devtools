import { watch, onMounted, onUnmounted, type Ref, type ShallowRef } from 'vue';
import type { PluginClientInstance, LauncherMenuItem } from '@u-devtools/core';

/**
 * Composable для управления пунктами меню launcher button.
 * Собирает пункты меню из всех плагинов и отправляет их через BroadcastChannel.
 */
export function useLauncherMenu(plugins: Ref<PluginClientInstance[]> | ShallowRef<PluginClientInstance[]>) {
  let channel: BroadcastChannel | null = null;

  const collectMenuItems = (): Array<{ pluginName: string; items: LauncherMenuItem[] }> => {
    const result: Array<{ pluginName: string; items: LauncherMenuItem[] }> = [];
    
    plugins.value.forEach((plugin) => {
      if (plugin.launcherMenuItems && plugin.launcherMenuItems.length > 0) {
        result.push({
          pluginName: plugin.name,
          items: plugin.launcherMenuItems,
        });
      }
    });

    return result;
  };

  const sendMenuItems = () => {
    if (!channel) return;
    
    const menuItems = collectMenuItems();
    try {
      channel.postMessage({
        event: 'update-menu-items',
        data: menuItems,
      });
    } catch (e) {
      console.warn('[LauncherMenu] Failed to send menu items:', e);
    }
  };

  onMounted(() => {
    channel = new BroadcastChannel('u-devtools:launcher-menu');
    
    // Отправляем пункты меню при монтировании
    sendMenuItems();
    
    // Отслеживаем изменения в плагинах
    watch(
      plugins,
      () => {
        sendMenuItems();
      },
      { deep: true }
    );
  });

  onUnmounted(() => {
    if (channel) {
      channel.close();
      channel = null;
    }
  });

  return {
    sendMenuItems,
  };
}

