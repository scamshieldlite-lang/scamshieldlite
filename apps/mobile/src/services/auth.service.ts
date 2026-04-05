// apps/mobile/src/services/auth.service.ts

import { apiClient } from "./api.service";
import { storageService, StorageKey } from "./storage.service";
import type { AuthUser } from "@scamshieldlite/shared/";

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

// Better Auth actual response shape
interface BetterAuthResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UserSession {
  user: AuthUser;
  token: string;
}

export const authService = {
  async login(params: LoginParams): Promise<UserSession> {
    const { data } = await apiClient.post<BetterAuthResponse>(
      "/auth/sign-in/email",
      params,
    );

    // Better Auth returns token at top level
    const token = data.token;
    const user = data.user;

    if (!token || !user) {
      throw new Error("Invalid response from auth server");
    }

    await storageService.set(StorageKey.AUTH_TOKEN, token);
    await storageService.set(StorageKey.USER_ID, user.id);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },

  async signUp(params: SignUpParams): Promise<UserSession> {
    const { data } = await apiClient.post<BetterAuthResponse>(
      "/auth/sign-up/email",
      params,
    );

    const token = data.token;
    const user = data.user;

    if (!token || !user) {
      throw new Error("Invalid response from auth server");
    }

    await storageService.set(StorageKey.AUTH_TOKEN, token);
    await storageService.set(StorageKey.USER_ID, user.id);
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
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
      const { data } =
        await apiClient.get<BetterAuthResponse>("/auth/get-session");
      if (!data?.user) return null;

      return {
        token: data.token ?? "",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        },
      };
    } catch {
      return null;
    }
  },
};
