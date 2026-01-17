// Helper to get value from command line args or env
// This file is shared across all plugin prompts
function getArg(name) {
  // Check environment variables first (HYGEN_ prefix)
  if (process.env[`HYGEN_${name}`]) {
    return process.env[`HYGEN_${name}`];
  }
  // Check process.argv for --name value pattern
  const args = process.argv;
  const index = args.indexOf(`--${name}`);
  if (index !== -1 && args[index + 1]) {
    return args[index + 1];
  }
  return null;
}

// Parse features from string
function parseFeatures(featuresStr) {
  if (!featuresStr) return null;
  const features = featuresStr.split(',').map((f) => f.trim());
  const choices = [
    { name: 'Settings Schema', value: 'settings' },
    { name: 'Command Palette Commands', value: 'commands' },
    { name: 'Sidebar Panel', value: 'sidebar' },
    { name: 'Overlay Menu Item', value: 'overlay' },
    { name: 'File System Operations (Server)', value: 'filesystem' },
    { name: 'App Context Communication', value: 'app-bridge' },
  ];
  return choices
    .map((choice, index) => (features.includes(choice.value) ? index : -1))
    .filter((i) => i !== -1);
}

module.exports = { getArg, parseFeatures };
