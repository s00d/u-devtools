module.exports = [
  {
    type: 'input',
    name: 'projectName',
    message: 'Project folder name:',
    default: 'my-devtools-plugin',
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
    default: 'My Plugin',
  },
  {
    type: 'input',
    name: 'packageName',
    message: 'Package name (in package.json):',
    default: (answers) => {
      const base = answers.projectName || 'my-plugin';
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
    default: 'A React plugin for Universal DevTools',
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
    initial: [0, 1, 4, 5], // Индексы выбранных по умолчанию
  },
];

