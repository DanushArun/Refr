const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
const defaultResolveRequest = config.resolver.resolveRequest;
const skiaWebShim = path.resolve(__dirname, 'src/platform/skia.web.tsx');

config.resolver.extraNodeModules = {
  '@refr/shared': path.resolve(__dirname, 'packages/shared'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@shopify/react-native-skia') {
    return { type: 'sourceFile', filePath: skiaWebShim };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

config.watchFolders = [
  path.resolve(__dirname, 'packages/shared'),
];

module.exports = config;
