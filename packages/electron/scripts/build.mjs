// packages/electron/scripts/build.mjs
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const packagesDir = path.resolve(rootDir, '../');
const pluginsDir = path.resolve(rootDir, '../../plugins');

const isProd = process.env.NODE_ENV === 'production';
const isWatch = process.argv.includes('--watch');

// 1. Умный плагин для внешних зависимостей
// Логика: всё, что не относительный путь и не наши пакеты -> external
const autoExternalPlugin = {
  name: 'auto-external',
  setup(build) {
    // Всегда исключаем встроенные модули Node.js
    build.onResolve({ filter: /^node:/ }, (args) => ({ path: args.path, external: true }));

    build.onResolve({ filter: /.*/ }, (args) => {
      // 1. Если это наш код (начинается с . или / или @u-devtools) -> БАНДЛИМ
      if (
        args.path.startsWith('.') || 
        args.path.startsWith('/') || 
        args.path.startsWith('@u-devtools/')
      ) {
        return null; // Продолжаем обработку (попадет в workspacePlugin или bundle)
      }

      // 2. Всё остальное (vite, electron, ws, ignore, chokidar...) -> EXTERNAL
      // Electron найдет их в node_modules
      return { path: args.path, external: true };
    });
  },
};

// 2. Плагин для сборки TS исходников из монорепозитория
const workspacePlugin = {
  name: 'workspace-plugin',
  setup(build) {
    build.onResolve({ filter: /^@u-devtools\// }, args => {
      const fullPath = args.path.replace('@u-devtools/', '');
      
      // Стратегия поиска: сначала plugins, потом packages
      // Поддержка как 'plugin-name', так и 'plugin-name/src/server'
      let searchPaths = [];
      
      if (fullPath.includes('/src/')) {
        // Прямой путь к файлу внутри пакета (например, plugin-name/src/server)
        const [pkgName, ...rest] = fullPath.split('/');
        const simpleName = pkgName.replace(/^plugin-/, '');
        const subPath = rest.join('/');
        
        searchPaths = [
          path.join(pluginsDir, simpleName, subPath),
          path.join(pluginsDir, pkgName, subPath),
          path.join(packagesDir, simpleName, subPath),
        ];
      } else {
        // Импорт пакета целиком (entry point)
        const [pkgName, ...rest] = fullPath.split('/');
        const simpleName = pkgName.replace(/^plugin-/, '');
        const subPath = rest.length > 0 ? rest.join('/') : 'src/index';

        searchPaths = [
          path.join(pluginsDir, simpleName, subPath),
          path.join(pluginsDir, pkgName, subPath),
          path.join(packagesDir, simpleName, subPath),
        ];
      }

      // Хелпер для проверки путей
      const tryExtensions = (base) => {
        // Если это папка, ищем index.ts
        if (fs.existsSync(path.join(base, 'src/index.ts'))) return path.join(base, 'src/index.ts');
        if (fs.existsSync(path.join(base, 'index.ts'))) return path.join(base, 'index.ts');
        
        // Если это файл (импорт подмодуля)
        if (fs.existsSync(base + '.ts')) return base + '.ts';
        if (fs.existsSync(path.join(base, 'index.ts'))) return path.join(base, 'index.ts');
        
        // Специфично для u-devtools структуры (src/server -> src/server.ts)
        if (base.includes('/src/')) {
           if (fs.existsSync(base + '.ts')) return base + '.ts';
        }
        
        return null;
      };

      for (const p of searchPaths) {
        const found = tryExtensions(p);
        if (found) return { path: found, namespace: 'workspace-ts' };
      }
      
      return null;
    });

    build.onLoad({ filter: /.*/, namespace: 'workspace-ts' }, async (args) => {
      let source = await fs.promises.readFile(args.path, 'utf8');
      // Патчим import.meta.url чтобы он работал в бандле как в исходнике
      if (source.includes('import.meta.url')) {
        source = source.replace(/\bimport\.meta\.url\b/g, JSON.stringify(`file://${args.path}`));
      }
      return { contents: source, loader: 'ts', resolveDir: path.dirname(args.path) };
    });
  },
};

// Очистка и подготовка
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Копирование статики
const copyFiles = () => {
  const files = ['src/renderer.html'];
  files.forEach(f => {
    const src = path.join(rootDir, f);
    const dest = path.join(rootDir, f.replace('src/', 'dist/'));
    if (fs.existsSync(src)) fs.copyFileSync(src, dest);
  });
};
copyFiles();

// Общие настройки
const commonConfig = {
  bundle: true,
  platform: 'node',
  target: 'node18',
  minify: isProd,
  sourcemap: !isProd,
  treeShaking: true,
  define: {
    'import.meta.env': 'undefined',
    'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
  },
  // Важен порядок: сначала резолвим свои пакеты, всё остальное помечаем внешним
  plugins: [workspacePlugin, autoExternalPlugin],
};

const contexts = [
  { ...commonConfig, entryPoints: [path.join(rootDir, 'src/main.ts')], outfile: path.join(rootDir, 'dist/main.js'), format: 'esm' },
  { ...commonConfig, entryPoints: [path.join(rootDir, 'src/preload.ts')], outfile: path.join(rootDir, 'dist/preload.js'), format: 'cjs' },
];

async function run() {
  if (isWatch) {
    const { context } = await import('esbuild');
    const watchContexts = await Promise.all(contexts.map(async (opt) => {
      const ctx = await context(opt);
      await ctx.watch();
      return ctx;
    }));
    console.log('⚡️ Watching...');
    // Держим процесс живым
    process.on('SIGINT', async () => {
      await Promise.all(watchContexts.map(ctx => ctx.dispose()));
      process.exit(0);
    });
  } else {
    await Promise.all(contexts.map(opt => build(opt)));
    console.log('✅ Build complete');
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
