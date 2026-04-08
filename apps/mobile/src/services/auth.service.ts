import { apiClient } from "./api.service";
import { storageService, StorageKey } from "./storage.service";
import { tokenStore } from "./tokenStore";
import type { AuthUser } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

interface BetterAuthResponse {
  token?: string;
  redirect?: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UserSession {
  user: AuthUser;
  token: string;
}

async function storeSession(token: string, userId: string): Promise<void> {
  // 1. Set in memory immediately — interceptor will use this right away
  tokenStore.set(token);

  // 2. Persist to SecureStore for app restart recovery
  await storageService.set(StorageKey.AUTH_TOKEN, token);
  await storageService.set(StorageKey.USER_ID, userId);

  logger.debug(
    "Token set in memory and SecureStore:",
    token.substring(0, 20) + "...",
  );
}

export const authService = {
  async login(params: LoginParams): Promise<UserSession> {
    const { data } = await apiClient.post<BetterAuthResponse>(
      "/auth/sign-in/email",
      {
        email: params.email,
        password: params.password,
      },
    );

    logger.debug("Sign-in response:", JSON.stringify(data));

    if (!data.token || !data.user) {
      throw new Error(
        `Invalid login response — token: ${!!data.token}, user: ${!!data.user}`,
      );
    }

    await storeSession(data.token, data.user.id);

    logger.info("Login successful for:", data.user.email);

    return {
      token: data.token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
      },
    };
  },

  async signUp(params: SignUpParams): Promise<UserSession> {
    // Step 1 — Create account
    await apiClient.post<BetterAuthResponse>("/auth/sign-up/email", {
      email: params.email,
      password: params.password,
      name: params.name,
    });

    // Step 2 — Sign in (stores token in memory immediately)
    const session = await this.login({
      email: params.email,
      password: params.password,
    });

    // Step 3 — Ensure trial subscription exists
    // Token is now in memory so this request is authenticated
    try {
      await apiClient.post("/subscription/ensure-trial");
    } catch (error) {
      // Non-fatal — trial will be created on next usage check
      logger.warn("Could not ensure trial subscription:", error);
    }

    return session;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/sign-out");
    } catch {
      // Always clear local state even if server call fails
    } finally {
      tokenStore.clear();
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
