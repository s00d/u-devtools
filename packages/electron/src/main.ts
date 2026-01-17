import { app, BrowserWindow, protocol, net, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import fsSync from 'node:fs'; // Use sync version for initial loading
import { PluginHost } from './plugin-host';
import { getPluginsList } from './plugins-registry';
import type { DevToolsPlugin } from '@u-devtools/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Development mode
const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

// Static file paths
const PROD_CLIENT_PATH = path.join(process.resourcesPath, 'client-dist');
// Path to built client in monorepo (for Dev Fallback)
const DEV_CLIENT_DIST_PATH = path.resolve(__dirname, '../../client/dist-app');

// === IMPORTANT: Register scheme before app startup ===
// This allows access to localStorage, Cookies and ServiceWorkers for app:// protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,      // Behaves like http (has origin)
      secure: true,        // Considered secure (like https)
      supportFetchAPI: true,
      corsEnabled: true,   // Allows CORS
      allowServiceWorkers: true,
    },
  },
]);

let mainWindow: BrowserWindow | null = null;
const host = new PluginHost(3000);

// === PERSISTENT CONFIG LOGIC ===
const CONFIG_PATH = path.join(app.getPath('userData'), 'udt-config.json');

// Helper for reading
function readConfig() {
  try {
    if (fsSync.existsSync(CONFIG_PATH)) {
      return JSON.parse(fsSync.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('[Main] Failed to read config:', e);
  }
  return {};
}

// Helper for writing
function writeConfig(data: Record<string, any>) {
  try {
    const current = readConfig();
    const newConfig = { ...current, ...data };
    fsSync.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
    return newConfig;
  } catch (e) {
    console.error('[Main] Failed to write config:', e);
    return {};
  }
}

// Optimized plugin setup function
async function setupPlugin(def: { factory: () => DevToolsPlugin, setupServer?: any }): Promise<DevToolsPlugin> {
  const plugin = def.factory() as DevToolsPlugin;
  
  if (def.setupServer && plugin.setupServer) {
    plugin.setupServer = def.setupServer;
  }

  if (!plugin.clientPath) return plugin;

  if (isDev) {
    console.log(`[Dev] Plugin ${plugin.name} -> Source: ${plugin.clientPath}`);
  } else {
    // Logic for PROD
    const pluginDirName = plugin.name.replace(/(@u-devtools\/plugin-|u-devtools-plugin-)/, '');
    const distPath = path.join(process.resourcesPath, 'plugins', pluginDirName, 'dist');
    
    // Check file existence (optimized)
    const possibleFiles = ['client.js', 'client.es.js'];
    let foundPath: string | undefined;

    for (const file of possibleFiles) {
      const fullPath = path.join(distPath, file);
      // Use stat instead of access for reliability
      try {
        await fs.stat(fullPath);
        foundPath = fullPath;
        break;
      } catch {}
    }

    if (foundPath) {
      plugin.clientPath = foundPath;
    } else {
      console.warn(`[Prod] ⚠️ Build not found for ${plugin.name}`);
      delete plugin.clientPath;
    }
  }

  return plugin;
}


async function createWindow() {
  // Configure app:// protocol
  // In Dev mode we register it too to have fallback capability
  // Now handle SPA routing
  protocol.handle('app', async (req) => {
    const url = new URL(req.url);
    
    if (url.hostname === 'devtools') {
      const filePath = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      
      // Determine base path (Prod resources or local build)
      const basePath = isDev ? DEV_CLIENT_DIST_PATH : PROD_CLIENT_PATH;
      const fullPath = path.join(basePath, filePath);

      try {
        // 1. Try to find file as-is
        await fs.access(fullPath);
        return net.fetch(pathToFileURL(fullPath).toString());
      } catch (e) {
        // 2. File not found.
        // If it's not an asset (no extension, e.g. /about), serve index.html (SPA Fallback)
        if (!path.extname(filePath)) {
          const indexPath = path.join(basePath, 'index.html');
          return net.fetch(pathToFileURL(indexPath).toString());
        }
        
        // 3. If it's an asset (style.css, script.js) and it doesn't exist - return 404
        return new Response('Not Found', { status: 404 });
      }
    }
    return new Response('Not Found', { status: 404 });
  });

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // In Dev mode disable webSecurity for CORS
      webSecurity: !isDev,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());

  // Keep did-fail-load handler only as "last resort",
  // if even local build failed to open
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return;
    
    // If we already tried to load app:// and it failed - then show renderer.html
    if (validatedURL.startsWith('app://')) {
      console.log('[Electron] Critical failure, showing loader:', errorDescription);
      mainWindow?.loadFile(path.join(__dirname, 'renderer.html'));
    }
  });

  const projectRoot = process.cwd();
  
  // Load plugins via registry
  const definitions = getPluginsList(projectRoot);
  const plugins = await Promise.all(definitions.map(setupPlugin));

  for (const p of plugins) {
    host.addPlugin(p);
  }
  
  host.setDevMode(isDev);
  
  // Check Vite server availability before passing it
  // If unavailable, pass null, and host will switch to fallback (dist)
  if (isDev) {
    try {
      // Quick check
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 200);
      await fetch(VITE_DEV_SERVER_URL, { method: 'HEAD', signal: controller.signal });
      
      console.log(`[Main] Vite Server detected at ${VITE_DEV_SERVER_URL}. Enabling source mode.`);
      host.setViteServerUrl(VITE_DEV_SERVER_URL);
    } catch (e) {
      console.warn(`[Main] Vite Server NOT detected. Plugins will fallback to dist mode.`);
      host.setViteServerUrl(''); // Empty string = disabled
    }
  }

  // === IMPORTANT: Connect config saving ===
  host.setConfigHandler((data) => {
    console.log('[Main] RPC Request: Saving config...', data);
    writeConfig(data);
  });

  try {
    await host.start(projectRoot);
    console.log(`[Main] Host started on :3000`);
  } catch (error) {
    console.error('[Main] Host start failed:', error);
  }

  // === SIMPLIFIED LOADING LOGIC ===
  const loadApp = async () => {
    if (isDev) {
      // 1. Try Vite Dev Server immediately
      try {
        console.log(`[Electron] Trying Vite Dev Server: ${VITE_DEV_SERVER_URL}`);
        await mainWindow?.loadURL(`${VITE_DEV_SERVER_URL}/__devtools/index.html`);
      } catch (e) {
        // 2. If Vite is unavailable (connection error) -> Load local build immediately
        console.log('[Electron] Vite server unreachable. Falling back to local build (app://)');
        try {
          await mainWindow?.loadURL('app://devtools/index.html');
        } catch (e2) {
          // 3. If build is also missing -> did-fail-load will trigger and show renderer.html
          console.error('[Electron] Local build unreachable:', e2);
        }
      }
    } else {
      // PROD
      mainWindow?.loadURL('app://devtools/index.html').catch(() => {
        mainWindow?.loadFile(path.join(__dirname, 'renderer.html'));
      });
    }
  };

  // === ADDED: Reset handler ===
  ipcMain.handle('u-devtools:clear-storage', async () => {
    if (mainWindow) {
      console.log('[Main] Clearing storage data...');
      // Clear LocalStorage, Cookies, Cache of entire session
      await mainWindow.webContents.session.clearStorageData();
      // Reload window via loadApp
      loadApp();
    }
  });

  // === IPC for settings ===
  
  // 1. Synchronous get (for preload)
  ipcMain.on('u-devtools:get-config-sync', (event) => {
    event.returnValue = readConfig();
  });

  // 2. Asynchronous save (from UI)
  ipcMain.handle('u-devtools:save-config', (_, data) => {
    console.log('[Main] Saving config:', data);
    return writeConfig(data);
  });

  // 3. NEW IPC: Connection check (Reliable version)
  ipcMain.handle('u-devtools:check-connection', async (_, url) => {
    // For app:// (production) always consider it available
    if (url.startsWith('app://')) return true;

    try {
      // Use native fetch (Node.js), not net.fetch (Electron)
      // This avoids issues with Electron proxy and Chromium network stack specifics
      const controller = new AbortController();
      // Timeout 1 second (quick check)
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      // Try to connect
      const response = await fetch(url, { 
        method: 'HEAD', 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      // If server responded with anything (even 404 or 500) - port is alive
      return true;
    } catch (e) {
      // If localhost didn't work, try 127.0.0.1 (fix for Node 17+ IPv6)
      if (url.includes('localhost')) {
        try {
          const ipv4Url = url.replace('localhost', '127.0.0.1');
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1000);
          await fetch(ipv4Url, { method: 'HEAD', signal: controller.signal });
          clearTimeout(timeoutId);
          return true;
        } catch (e2) {
          return false;
        }
      }
      return false;
    }
  });

  // 4. NEW IPC: Reload
  ipcMain.handle('u-devtools:reload', () => {
    // Restart URL selection procedure
    loadApp();
  });

  loadApp();
  
  // Open Electron DevTools
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  host.stop();
  app.quit();
});
