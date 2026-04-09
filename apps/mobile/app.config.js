const BRAND_NAVY = "#0B1F3A";

module.exports = ({ config }) => ({
  ...config,
  name: "ScamShieldLite",
  slug: "scamshieldlite",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],

  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: BRAND_NAVY,
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: BRAND_NAVY,
    },
    // package: "com.ibnballo.scamshieldlite.app",
    package: "com.scamshieldlite.app",
    permissions: [
      "com.android.vending.BILLING",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.CAMERA",
    ],
  },

  plugins: [
    "expo-secure-store",
    "react-native-iap",
    // "expo-device",
    [
      "expo-image-picker",
      {
        photosPermission:
          "ScamShieldLite needs access to your photos to scan screenshot messages for scams.",
        cameraPermission:
          "ScamShieldLite needs camera access to capture screenshots for scam analysis.",
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          newArchEnabled: true,
          kotlinVersion: "2.1.20",
          usesCleartextTraffic: true,
        },
      },
    ],
    // "./node_modules/@react-native-ml-kit/text-recognition/app.plugin.js",
    // ML Kit plugin — enables on-device model bundling
    // [
    //   "@react-native-ml-kit/text-recognition",
    //   {
    //     // Bundle the Latin script model — covers English + most
    //     // Nigerian language text (Yoruba, Igbo, Hausa use Latin)
    //     // Additional scripts can be added but increase APK size
    //     languages: ["latin"],
    //   },
    // ],
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: BRAND_NAVY,
      },
    ],
  ],

  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
    eas: {
      projectId: "8ea49fa7-ba5b-42ec-b27f-484a00d89e60",
    },
  },
});
