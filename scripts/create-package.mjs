#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const program = new Command();

program
  .name('create-package')
  .description('Create a new Universal DevTools package')
  .option('-n, --name <name>', 'Package name (e.g., my-package)')
  .option('--package-name <name>', 'Full package name (e.g., @u-devtools/my-package)')
  .option('-d, --description <text>', 'Package description')
  .option('--use-vue', 'Include Vue support')
  .option('--path <path>', 'Target directory (default: packages/)')
  .addHelpText(
    'after',
    `
Examples:
  $ pnpm run create:package
  $ pnpm run create:package --name my-package
  $ pnpm run create:package --name my-package --package-name "@u-devtools/my-package" --description "My awesome package" --use-vue
  $ pnpm run create:package --name my-package --path custom/path
`
  )
  .action((options) => {
    if (!options.name) {
      console.error('Error: Package name is required');
      console.error('Usage: pnpm run create:package --name <name> [options]');
      process.exit(1);
    }

    // Определяем путь для создания пакета
    let targetPath = process.cwd();
    if (options.path) {
      targetPath = resolve(process.cwd(), options.path);
    } else {
      // Если команда запущена из корня проекта, создаем в packages/
      const isRoot =
        existsSync(join(process.cwd(), 'packages')) && existsSync(join(process.cwd(), 'plugins'));

      if (isRoot) {
        targetPath = join(process.cwd(), 'packages');
      }
    }

    // Переходим в директорию create и запускаем hygen
    const createDir = join(rootDir, 'packages', 'create');

    // Формируем команду hygen с параметрами
    const hygenArgs = [`package`, `new`];

    // Функция для безопасного экранирования аргументов
    function escapeArg(arg) {
      if (/[\s"$`\\]/.test(arg)) {
        return `"${arg.replace(/"/g, '\\"')}"`;
      }
      return arg;
    }

    // Передаем указанные параметры в hygen
    if (options.name) {
      hygenArgs.push(`--name`, options.name);
    }
    if (options.packageName) {
      hygenArgs.push(`--packageName`, options.packageName);
    }
    if (options.description) {
      hygenArgs.push(`--description`, options.description);
    }
    if (options.useVue) {
      hygenArgs.push(`--useVue`);
    }

    // Формируем команду с правильным экранированием
    const hygenCommand = `pnpm --dir "${createDir}" exec hygen ${hygenArgs.map(escapeArg).join(' ')}`;

    execSync(hygenCommand, {
      stdio: 'inherit',
      cwd: targetPath,
      env: {
        ...process.env,
        HYGEN_TMPLS: join(createDir, '_templates'),
      },
      shell: true,
    });
  });

program.parse();
