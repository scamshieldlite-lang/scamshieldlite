import Constants from "expo-constants";

export const API_CONFIG = {
  baseURL:
    (Constants.expoConfig?.extra?.apiBaseUrl as string) ??
    "http://localhost:3000",
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;
