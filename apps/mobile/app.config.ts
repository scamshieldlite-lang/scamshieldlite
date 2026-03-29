// apps/mobile/app.config.ts

import type { ExpoConfig, ConfigContext } from "expo/config";

const BRAND_NAVY = "#0B1F3A"; // 🛡️ Your Primary Background

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "ScamShieldLite",
  slug: "scamshieldlite",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: BRAND_NAVY, // 👈 Updated
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: BRAND_NAVY, // 👈 Updated
    },
    package: "com.scamshieldlite.app",
    permissions: [],
  },
  plugins: [
    "expo-secure-store",
    "react-native-iap",
    // "expo-device",
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: BRAND_NAVY, // 👈 Updated
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  },
});
