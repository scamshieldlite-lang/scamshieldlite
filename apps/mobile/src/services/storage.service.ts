// apps/mobile/src/services/storage.service.ts

import * as SecureStore from "expo-secure-store";
import { logger } from "@/utils/logger";

// All storage keys in one place — no scattered string literals
export const StorageKey = {
  AUTH_TOKEN: "auth_token",
  REFRESH_TOKEN: "refresh_token",
  USER_ID: "user_id",
  DEVICE_FINGERPRINT: "device_fingerprint",
  HAS_ONBOARDED: "has_onboarded",
} as const;

export type StorageKeyType = (typeof StorageKey)[keyof typeof StorageKey];

export const storageService = {
  async set(key: StorageKeyType, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      logger.error(`SecureStore set failed for key: ${key}`, error);
      throw error;
    }
  },

  async get(key: StorageKeyType): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error(`SecureStore get failed for key: ${key}`, error);
      return null;
    }
  },

  async delete(key: StorageKeyType): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      logger.error(`SecureStore delete failed for key: ${key}`, error);
    }
  },

  async clearAuthData(): Promise<void> {
    await Promise.all([
      this.delete(StorageKey.AUTH_TOKEN),
      this.delete(StorageKey.REFRESH_TOKEN),
      this.delete(StorageKey.USER_ID),
    ]);
  },
};
