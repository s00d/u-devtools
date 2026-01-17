module.exports = [
  {
    type: 'input',
    name: 'name',
    message: 'Package folder name:',
    default: 'my-package',
    validate: (value) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Folder name must contain only lowercase letters, numbers, and hyphens';
      }
      return true;
    },
  },
  {
    type: 'input',
    name: 'packageName',
    message: 'Full package name (in package.json):',
    default: (answers) => {
      const base = answers.name || 'my-package';
      return `@u-devtools/${base}`;
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
    default: 'A package for Universal DevTools',
  },
  {
    type: 'confirm',
    name: 'useVue',
    message: 'Include Vue support?',
    default: false,
  },
];
