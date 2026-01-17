import type { RpcServerInterface, ServerContext } from '@u-devtools/core';
import { FileSystemService } from '@u-devtools/utils-node';
import { scanStories } from './server/scanner';
import { analyzeComponent } from './server/analyzer';
import { resolve, join } from 'node:path';
import { watch } from 'chokidar';
import type { FSWatcher } from 'chokidar';
import type { StoryFile, ComponentMeta } from './types';
import MarkdownIt from 'markdown-it';
import { ComponentsbookPathPayloadSchema } from './schemas';

let watchers: FSWatcher[] = [];

export function setupServer(rpc: RpcServerInterface, ctx: ServerContext) {
  const fs = new FileSystemService(ctx.root);

  rpc.handle('componentsbook:get-files', async () => {
    try {
      const files = await scanStories(ctx.root);
      return files.map(
        (f): StoryFile => ({
          id: f,
          path: f,
          name: f.split('/').pop() || f,
        })
      );
    } catch (e) {
      console.error('[componentsbook] Error scanning stories:', e);
      return [];
    }
  });

  rpc.handle('componentsbook:get-meta', async (payload) => {
    try {
      const { path } = payload as { path: string };
      // Try to find the component file (remove .stories.vue, add .vue)
      const componentPath = path.replace('.stories.vue', '.vue');

      // Check if component file exists
      try {
        await fs.access(componentPath);
        const fullPath = resolve(ctx.root, componentPath);
        return await analyzeComponent(fullPath, fs, ctx.root);
      } catch {
        // If component file doesn't exist, try parsing the story file itself
        const fullPath = resolve(ctx.root, path);
        return await analyzeComponent(fullPath, fs, ctx.root);
      }
    } catch (e) {
      console.error('[componentsbook] Error getting meta:', e);
      return { props: [], events: [], slots: [] } as ComponentMeta;
    }
  });

  rpc.handle('componentsbook:get-source', async (payload) => {
    try {
      const validationResult = ComponentsbookPathPayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
      }
      const { path } = validationResult.data;
      const content = await fs.read(path);
      
      // Удаляем блок <docs>...</docs> для отображения чистого кода
      return content.replace(/<docs[^>]*>[\s\S]*?<\/docs>/gi, '').trim();
    } catch (e) {
      console.error('[componentsbook] Error reading source:', e);
      return '';
    }
  });

  rpc.handle('componentsbook:get-story-path', async (payload) => {
    try {
      const validationResult = ComponentsbookPathPayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
      }
      const { path } = validationResult.data;
      
      // Check if file exists
      try {
        await fs.access(path);
        // Return path that can be used with dynamic import
        // Vite can resolve paths starting with / as absolute from project root
        // or relative paths from src
        const importPath = path.startsWith('/') ? path : `/${path}`;
        return importPath;
      } catch {
        // File doesn't exist, return empty string
        return '';
      }
    } catch (e) {
      console.error('[componentsbook] Error resolving story path:', e);
      return '';
    }
  });

  rpc.handle('componentsbook:get-story-docs', async (payload) => {
    try {
      const validationResult = ComponentsbookPathPayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
      }
      const { path } = validationResult.data;
      
      // Читаем файл истории
      const content = await fs.read(path);
      
      // Простой Regex для извлечения контента внутри <docs>...</docs>
      // Используем [\s\S] для захвата переносов строк
      const match = content.match(/<docs[^>]*>([\s\S]*?)<\/docs>/i);
      
      if (!match) {
        return null;
      }

      const markdownContent = match[1].trim();
      
      // Инициализация парсера Markdown с добавлением классов
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
      });

      // Переопределяем правила без использования ссылок на старые правила
      // Это предотвращает RangeError: Maximum call stack size exceeded

      md.renderer.rules.heading_open = (tokens, idx) => {
        const level = Number.parseInt(tokens[idx].tag.slice(1), 10);
        const sizes: Record<number, string> = {
          1: 'text-2xl font-bold text-white mb-4 mt-6 border-b border-gray-700 pb-2',
          2: 'text-xl font-semibold text-white mb-3 mt-5',
          3: 'text-lg font-medium text-white mb-2 mt-4',
          4: 'text-base font-medium text-white mb-2 mt-3',
        };
        const cls = sizes[level] || sizes[4];
        return `<h${level} class="${cls}">`;
      };

      md.renderer.rules.paragraph_open = () => {
        return '<p class="mb-4 text-gray-300 leading-relaxed text-sm">';
      };

      md.renderer.rules.code_inline = (tokens, idx) => {
        return `<code class="bg-gray-800 text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs border border-gray-700">${md.utils.escapeHtml(tokens[idx].content)}</code>`;
      };

      md.renderer.rules.fence = (tokens, idx) => {
        const token = tokens[idx];
        return `<pre class="bg-[#1e1e1e] p-3 rounded-lg border border-gray-700 overflow-x-auto mb-4 text-xs font-mono text-gray-300"><code>${md.utils.escapeHtml(token.content)}</code></pre>`;
      };

      md.renderer.rules.link_open = (tokens, idx) => {
        const href = tokens[idx].attrGet('href') || '#';
        return `<a href="${href}" target="_blank" class="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">`;
      };

      md.renderer.rules.bullet_list_open = () => '<ul class="list-disc pl-5 mb-4 text-gray-300 space-y-1">';
      md.renderer.rules.ordered_list_open = () => '<ol class="list-decimal pl-5 mb-4 text-gray-300 space-y-1">';
      md.renderer.rules.list_item_open = () => '<li class="text-sm">';
      
      md.renderer.rules.blockquote_open = () => '<blockquote class="border-l-4 border-indigo-500 bg-gray-800/50 pl-4 py-1 pr-2 mb-4 italic text-gray-400 rounded-r">';

      md.renderer.rules.table_open = () => '<div class="overflow-x-auto mb-4"><table class="w-full border-collapse text-sm text-left">';
      md.renderer.rules.table_close = () => '</table></div>';
      md.renderer.rules.thead_open = () => '<thead class="bg-gray-800 text-gray-200">';
      md.renderer.rules.th_open = () => '<th class="p-2 border border-gray-700 font-semibold">';
      md.renderer.rules.td_open = () => '<td class="p-2 border border-gray-700 text-gray-300">';

      // Парсим Markdown и возвращаем HTML
      return md.render(markdownContent);
    } catch (e) {
      console.error('[componentsbook] Error reading docs:', e);
      return `<div class="text-red-400 p-4 border border-red-500/50 rounded bg-red-500/10">Error parsing documentation: ${e instanceof Error ? e.message : String(e)}</div>`;
    }
  });

  // File watching for .stories.vue files
  // Note: File watching is always enabled in development mode
  {
    const componentsRoot = join(ctx.root, 'src');
    const watcher = watch('**/*.stories.vue', {
      cwd: componentsRoot,
      ignoreInitial: true,
    });

    watcher.on('change', async (file: string) => {
      console.log(`[componentsbook] File changed: ${file}`);
    });

    watcher.on('add', async (file: string) => {
      console.log(`[componentsbook] File added: ${file}`);
    });

    watcher.on('unlink', (file: string) => {
      console.log(`[componentsbook] File removed: ${file}`);
    });

    watchers.push(watcher);
  }

  // NEW: Analyze File Size
  rpc.handle('componentsbook:analyze-size', async (payload) => {
    try {
      const validationResult = ComponentsbookPathPayloadSchema.safeParse(payload);
      if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map((e) => e.message).join(', ')}`);
      }
      const { path } = validationResult.data;
      // Ищем .vue файл компонента
      const componentPath = path.replace('.stories.vue', '.vue');
      
      try {
        const stats = await fs.stat(componentPath);
        return {
          size: stats.size, // в байтах
          // В будущем тут можно подключить esbuild для реального анализа бандла
          gzipped: Math.floor(stats.size * 0.4), // Грубая эмуляция gzip (~40% от оригинала)
        };
      } catch {
        return { size: 0, gzipped: 0 };
      }
    } catch (e) {
      return { size: 0, gzipped: 0 };
    }
  });
}

/**
 * Cleanup watchers when server is closed
 */
export function cleanupServer() {
  for (const watcher of watchers) {
    watcher.close();
  }
  watchers = [];
}
