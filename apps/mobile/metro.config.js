const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (so shared types work)
config.watchFolders = [workspaceRoot];

// 2. Let Metro find the shared package
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// 3. Fix broken deep type imports in react-native-gesture-handler
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "react-native-gesture-handler/lib/typescript/components/touchables/TouchableNativeFeedback":
    require.resolve(
      "react-native-gesture-handler/src/components/touchables/TouchableNativeFeedback.android.tsx"
    ),
  "react-native-gesture-handler/lib/typescript/components/touchables/TouchableOpacity":
    require.resolve(
      "react-native-gesture-handler/src/components/touchables/TouchableOpacity.tsx"
    ),
  "react-native-gesture-handler/lib/typescript/components/touchables/TouchableWithoutFeedback":
    require.resolve(
      "react-native-gesture-handler/src/components/touchables/TouchableWithoutFeedback.tsx"
    ),
};

module.exports = config;