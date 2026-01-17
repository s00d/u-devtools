#!/usr/bin/env node
import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const program = new Command();

program
  .name('create-plugin')
  .description('Create a new Universal DevTools plugin')
  .argument('<type>', 'Plugin type (vue, react, solid, svelte, vanilla, lit)')
  .option('-n, --name <name>', 'Project folder name')
  .option('-p, --plugin-name <name>', 'Plugin display name')
  .option('--package-name <name>', 'Package name')
  .option('-d, --description <text>', 'Description')
  .option(
    '-f, --features <list>',
    'Comma-separated features (settings,commands,sidebar,overlay,filesystem,app-bridge)'
  )
  .option('--path <path>', 'Target directory (default: plugins/ if in root, else current dir)')
  .addHelpText(
    'after',
    `
Examples:
  $ pnpm run create:plugin vue
  $ pnpm run create:plugin react --name my-plugin --plugin-name "My Plugin"
  $ pnpm run create:plugin vue --name my-plugin --plugin-name "My Plugin" --package-name "@u-devtools/plugin-my" --description "My awesome plugin" --features settings,commands,sidebar
  $ pnpm run create:plugin vanilla --name my-plugin --path custom/path
`
  )
  .action(async (type, options) => {
    const validTypes = ['vue', 'react', 'solid', 'svelte', 'vanilla', 'lit'];

    if (!validTypes.includes(type)) {
      console.error(`Error: Invalid plugin type "${type}"`);
      console.error('Available types:', validTypes.join(', '));
      process.exit(1);
    }

    // Определяем путь для создания плагина
    let targetPath = process.cwd();
    if (options.path) {
      targetPath = resolve(process.cwd(), options.path);
    } else {
      // Если команда запущена из корня проекта, создаем в plugins/
      const isRoot =
        existsSync(join(process.cwd(), 'plugins')) && existsSync(join(process.cwd(), 'packages'));

      if (isRoot) {
        targetPath = join(process.cwd(), 'plugins');
      }
    }

    // Переходим в директорию create и запускаем hygen
    const createDir = join(rootDir, 'packages', 'create');

    // Формируем команду hygen с параметрами
    const hygenArgs = [`plugin`, type];

    // Функция для безопасного экранирования аргументов
    function escapeArg(arg) {
      if (/[\s"$`\\]/.test(arg)) {
        return `"${arg.replace(/"/g, '\\"')}"`;
      }
      return arg;
    }

    // Передаем указанные параметры в hygen через переменные окружения
    // Hygen использует переменные окружения с префиксом HYGEN_ или аргументы командной строки
    const hygenEnv = {
      ...process.env,
      HYGEN_TMPLS: join(createDir, '_templates'),
    };

    // Устанавливаем переменные окружения для hygen
    if (options.name) {
      hygenEnv.HYGEN_projectName = options.name;
      hygenArgs.push(`--projectName`, options.name);
    }
    if (options.pluginName) {
      hygenEnv.HYGEN_pluginName = options.pluginName;
      hygenArgs.push(`--pluginName`, options.pluginName);
    }
    // Auto-generate packageName if not provided but name is provided
    const packageName =
      options.packageName ||
      (options.name
        ? `@u-devtools/plugin-${options.name.replace(/^my-devtools-plugin-?/, '').replace(/^my-plugin-?/, '')}`
        : null);
    if (packageName) {
      hygenEnv.HYGEN_packageName = packageName;
      hygenArgs.push(`--packageName`, packageName);
    }
    if (options.description) {
      hygenEnv.HYGEN_description = options.description;
      hygenArgs.push(`--description`, options.description);
    }
    if (options.features) {
      hygenEnv.HYGEN_features = options.features;
      hygenArgs.push(`--features`, options.features);
    }

    // Формируем команду с правильным экранированием
    // Используем npx hygen с правильным cwd (targetPath)
    // HYGEN_TMPLS уже установлен в hygenEnv
    const hygenCommand = `npx --yes hygen ${hygenArgs.map(escapeArg).join(' ')}`;

    // Важно: cwd должен быть targetPath, чтобы hygen создавал файлы в правильной директории
    // Hygen использует process.cwd() для определения места создания файлов
    execSync(hygenCommand, {
      stdio: 'inherit',
      cwd: targetPath,
      env: hygenEnv,
      shell: true,
    });

    // Add plugin to playground if we're in the monorepo root
    const isMonorepoRoot =
      existsSync(join(rootDir, 'playground')) && existsSync(join(rootDir, 'plugins'));
    
    if (isMonorepoRoot && packageName) {
      console.log('\n📦 Adding plugin to playground...');
      await addPluginToPlayground(rootDir, packageName, options.name || 'my-plugin');
    }
  });

/**
 * Adds plugin to playground package.json
 */
async function addPluginToPlayground(rootDir, packageName, pluginName) {
  const playgroundDir = join(rootDir, 'playground');
  const packageJsonPath = join(playgroundDir, 'package.json');

  // Add to package.json
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      // Add to devDependencies if not already present
      if (!packageJson.devDependencies[packageName]) {
        packageJson.devDependencies[packageName] = 'workspace:*';
        
        // Sort devDependencies alphabetically
        const sortedDevDeps = Object.keys(packageJson.devDependencies)
          .sort()
          .reduce((acc, key) => {
            acc[key] = packageJson.devDependencies[key];
            return acc;
          }, {});
        packageJson.devDependencies = sortedDevDeps;
        
        writeFileSync(
          packageJsonPath,
          JSON.stringify(packageJson, null, 2) + '\n',
          'utf-8'
        );
        console.log(`✅ Added ${packageName} to playground/package.json`);
      } else {
        console.log(`ℹ️  ${packageName} already in playground/package.json`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to update playground/package.json: ${error.message}`);
    }
  }
}

program.parse();
