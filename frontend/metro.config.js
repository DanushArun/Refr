const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch both frontend and root node_modules
config.watchFolders = [monorepoRoot];

// Resolve modules from both frontend and root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Also resolve the shared package
config.resolver.extraNodeModules = {
  '@refr/shared': path.resolve(monorepoRoot, 'packages/shared'),
};

module.exports = config;
