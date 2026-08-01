import Constants from "expo-constants";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://scamshieldlite-api.onrender.com";

if (__DEV__) {
  console.log("[API] Base URL:", apiBaseUrl);
}

export const API_CONFIG = {
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;
