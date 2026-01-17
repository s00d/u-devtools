import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { plugins } from 'virtual:u-devtools-plugins';
import PluginPage from '../views/PluginPage.vue';
import InternalPage from '../views/InternalPage.vue';

// Storage key for last route
const LAST_ROUTE_KEY = 'u-devtools:last-route';

// Helper function to get last saved route
function getLastRoute(): string | null {
  try {
    return localStorage.getItem(LAST_ROUTE_KEY);
  } catch (e) {
    return null;
  }
}

// Helper function to check if route is valid
function isValidRoute(routePath: string): boolean {
  // Check if it's a plugin route
  if (routePath.startsWith('/plugins/')) {
    const pluginName = routePath.split('/plugins/')[1]?.split('?')[0]; // Remove query params
    return plugins.some((p) => p.name === pluginName);
  }

  // Check if it's an internal route
  return routePath === '/about' || routePath === '/marketplace';
}

// Базовые маршруты
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      // Пытаемся восстановить последний маршрут
      const lastRoute = getLastRoute();
      if (lastRoute) {
        // Очищаем путь от base, если он там есть
        const cleanPath = lastRoute.replace('/__devtools', '').replace('/index.html', '').split('?')[0] || '/';
        if (cleanPath !== '/' && isValidRoute(cleanPath)) {
          return cleanPath;
        }
      }
      // Fallback к первому плагину или about
      const first = plugins[0];
      return first ? `/plugins/${first.name}` : '/about';
    },
  },
  // Добавляем явный маршрут для index.html, чтобы поймать этот кейс
  {
    path: '/index.html',
    redirect: '/',
  },
  {
    path: '/about',
    name: 'about',
    component: InternalPage,
    props: { view: 'about' },
  },
  {
    path: '/marketplace',
    name: 'marketplace',
    component: InternalPage,
    props: { view: 'marketplace' },
  },
  // Динамический маршрут для всех плагинов
  {
    path: '/plugins/:pluginName',
    name: 'plugin',
    component: PluginPage,
    props: true,
  },
];

// Умное определение BASE URL
function getRouterBase() {
  const path = window.location.pathname;
  
  // Если мы явно видим /__devtools/ в URL (Vite режим)
  if (path.startsWith('/__devtools/')) {
    return '/__devtools/';
  }
  
  // Если есть конфиг от Electron (Standalone)
  if ((window as any).__UDEVTOOLS_CONFIG__?.base) {
    const configBase = (window as any).__UDEVTOOLS_CONFIG__.base;
    // Убеждаемся, что base заканчивается на / для createWebHistory
    return configBase.endsWith('/') ? configBase : `${configBase}/`;
  }

  // Fallback
  return '/';
}

const base = getRouterBase();
console.log('[Router] Initializing with base:', base);

const router = createRouter({
  // Важно: base должен совпадать с тем, что настроено в vite plugin (__devtools)
  // или быть относительным для standalone режима
  history: createWebHistory(base),
  routes,
});

// Save route to localStorage on navigation
router.afterEach((to) => {
  // Don't save redirect routes
  if (to.path === '/' || to.path === '/index.html') return;

  try {
    localStorage.setItem(LAST_ROUTE_KEY, to.fullPath);
  } catch (e) {
    // Ignore localStorage errors (e.g., in private browsing)
    console.warn('[DevTools] Failed to save last route:', e);
  }
});

export default router;
