import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

// Token storage backed by device SecureStore (hardware-encrypted)
const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },
};

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  storage: secureStorage,
});

// Named exports for clean imports in screens
export const { signIn, signUp, signOut, useSession } = authClient;
