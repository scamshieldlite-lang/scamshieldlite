// apps/mobile/babel.config.js

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for react-native-reanimated — must be last
      "react-native-reanimated/plugin",
      // Path alias support
      [
        "module-resolver",
        {
          root: ["./src"],
          alias: {
            "@": "./src",
            "@shared": "../../packages/shared/src",
          },
        },
      ],
    ],
  };
};
