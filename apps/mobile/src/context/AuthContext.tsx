import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { authService } from "@/services/auth.service";
import { storageService, StorageKey } from "@/services/storage.service";
import { tokenStore } from "@/services/tokenStore";
import type { AuthUser, AuthState } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";
import { apiClient } from "@/services/api.service";

interface AuthContextValue {
  user: AuthUser | null;
  authState: AuthState;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("unauthenticated");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  // Revalidate session when app comes back to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active" && authState === "authenticated") {
          authService.getSession().then((session) => {
            if (!session?.user) {
              logger.warn("Session expired in background — logging out");
              tokenStore.clear();
              storageService.clearAuthData();
              setUser(null);
              setAuthState("unauthenticated");
            }
          });
        }
      },
    );
    return () => subscription.remove();
  }, [authState]);

  async function restoreSession() {
    try {
      const storedToken = await storageService.get(StorageKey.AUTH_TOKEN);

      if (!storedToken) {
        logger.debug("No stored token — unauthenticated");
        setAuthState("unauthenticated");
        return;
      }

      // Restore to memory before making API call
      tokenStore.set(storedToken);
      logger.debug("Token restored to memory from SecureStore");

      const { data } = await apiClient.get("/auth/get-session");

      logger.debug("get-session response:", JSON.stringify(data));

      // Better Auth get-session returns { user, session } — not token
      // Check for user object directly
      if (data?.user?.id) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        });
        setAuthState("authenticated");
        logger.info("Session restored for:", data.user.email);
      } else {
        logger.warn("get-session returned no user — clearing token");
        tokenStore.clear();
        await storageService.clearAuthData();
        setAuthState("unauthenticated");
      }
    } catch (error) {
      logger.error("Session restore failed:", error);
      tokenStore.clear();
      await storageService.clearAuthData();
      setAuthState("unauthenticated");
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password });
    // tokenStore is already set inside authService.login via storeSession()
    // Just update React state
    setUser(session.user);
    setAuthState("authenticated");
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const session = await authService.signUp({ name, email, password });
      // tokenStore is already set inside authService.signUp → login → storeSession()
      setUser(session.user);
      setAuthState("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      if (authState === "authenticated") {
        await authService.logout();
      }
    } catch {
      // Always clear even if API fails
    } finally {
      tokenStore.clear();
      await storageService.clearAuthData();
      setUser(null);
      setAuthState("unauthenticated");
    }
  }, [authState]);

  const continueAsGuest = useCallback(() => {
    setAuthState("guest");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        isLoading,
        login,
        signUp,
        logout,
        continueAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
