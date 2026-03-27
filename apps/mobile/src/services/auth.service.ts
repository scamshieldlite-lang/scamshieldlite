// apps/mobile/src/services/auth.service.ts

import { apiClient } from "./api.service";
import { storageService, StorageKey } from "./storage.service";
import type { UserSession } from "@scamshieldlite/shared/";

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  async login(params: LoginParams): Promise<UserSession> {
    const { data } = await apiClient.post<UserSession>(
      "/auth/sign-in/email",
      params,
    );
    await storageService.set(StorageKey.AUTH_TOKEN, data.token);
    await storageService.set(StorageKey.USER_ID, data.user.id);
    return data;
  },

  async signUp(params: SignUpParams): Promise<UserSession> {
    const { data } = await apiClient.post<UserSession>(
      "/auth/sign-up/email",
      params,
    );
    await storageService.set(StorageKey.AUTH_TOKEN, data.token);
    await storageService.set(StorageKey.USER_ID, data.user.id);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/sign-out");
    } finally {
      // Always clear local state even if server call fails
      await storageService.clearAuthData();
    }
  },

  async getSession(): Promise<UserSession | null> {
    try {
      const { data } = await apiClient.get<UserSession>("/auth/get-session");
      return data;
    } catch {
      return null;
    }
  },
};
