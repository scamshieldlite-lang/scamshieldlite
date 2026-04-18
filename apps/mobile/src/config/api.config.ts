import Constants from "expo-constants";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

if (__DEV__) {
  console.log("[API] Base URL:", apiBaseUrl);
}

export const API_CONFIG = {
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Origin: "http://192.168.43.92:3000",
  },
} as const;
