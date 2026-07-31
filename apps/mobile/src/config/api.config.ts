import Constants from "expo-constants";

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const fallbackUrl = process.env.EXPO_PUBLIC_FALLBACK_API_URL?.trim() || null;

if (__DEV__) {
  console.log("[API] Base URL:", apiBaseUrl);
  console.log("[API CONFIG] Fallback URL:", fallbackUrl ?? "none");
}

export const API_CONFIG = {
  baseURL: apiBaseUrl,
  fallbackURL: fallbackUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;
