import { runner } from 'hygen';
import Logger from 'hygen/dist/logger.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Используем переменную окружения HYGEN_TMPLS, если она установлена, иначе дефолтный путь
const defaultTemplates = process.env.HYGEN_TMPLS || path.join(__dirname, '../_templates');

runner(process.argv.slice(2), {
  templates: defaultTemplates,
  cwd: process.cwd(),
  logger: new (Logger as unknown as { default: typeof Logger }).default(console.log.bind(console)),
  createPrompter: () => require('enquirer'),
  exec: (action, body) => {
    const opts = body && body.length > 0 ? { input: body } : {};
    return require('execa').shell(action, opts);
  },
  debug: !!process.env.DEBUG,
});
