const { getArg, parseFeatures } = require('../_prompt-helper.cjs');

const projectNameArg = getArg('projectName');
const pluginNameArg = getArg('pluginName');
const packageNameArg = getArg('packageName');
const descriptionArg = getArg('description');
const featuresArg = getArg('features');

// Auto-generate packageName from projectName if not provided
const finalPackageName =
  packageNameArg ||
  (projectNameArg
    ? `@u-devtools/plugin-${projectNameArg.replace(/^my-devtools-plugin-?/, '').replace(/^my-plugin-?/, '')}`
    : null);

// If all required args are provided (packageName can be auto-generated), skip prompts
const skipPrompts =
  projectNameArg && pluginNameArg && finalPackageName && descriptionArg && featuresArg;

// If skipping prompts, set all values in env so templates can access them
if (skipPrompts) {
  process.env.HYGEN_projectName = projectNameArg;
  process.env.HYGEN_pluginName = pluginNameArg;
  process.env.HYGEN_packageName = finalPackageName;
  process.env.HYGEN_description = descriptionArg;
  process.env.HYGEN_features = featuresArg;
  // Return empty array to skip all prompts
  module.exports = [];
} else {
  module.exports = [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project folder name:',
      default: projectNameArg || 'my-devtools-plugin',
      validate: (value) => {
        if (!/^[a-z0-9-]+$/.test(value)) {
          return 'Folder name must contain only lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'pluginName',
      message: 'Plugin display name:',
      default: pluginNameArg || 'My Plugin',
    },
    {
      type: 'input',
      name: 'packageName',
      message: 'Package name (in package.json):',
      default: (answers) => {
        if (finalPackageName) return finalPackageName;
        const base = answers.projectName || projectNameArg || 'my-plugin';
        return `@u-devtools/plugin-${base.replace(/^my-devtools-plugin-?/, '').replace(/^my-plugin-?/, '')}`;
      },
      validate: (value) => {
        if (!value) return 'Package name is required';
        if (!/^(@[a-z0-9-]+\/)?[a-z0-9-]+$/.test(value)) {
          return 'Invalid package name format';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      default: descriptionArg || 'A Svelte plugin for Universal DevTools',
    },
    {
      type: 'multiselect',
      name: 'features',
      message: 'Select features to include (use space to select, enter to confirm):',
      choices: [
        { name: 'Settings Schema', value: 'settings' },
        { name: 'Command Palette Commands', value: 'commands' },
        { name: 'Sidebar Panel', value: 'sidebar' },
        { name: 'Overlay Menu Item', value: 'overlay' },
        { name: 'File System Operations (Server)', value: 'filesystem' },
        { name: 'App Context Communication', value: 'app-bridge' },
      ],
      initial: featuresArg ? parseFeatures(featuresArg) : [0, 1, 4, 5],
    },
  ];
}
