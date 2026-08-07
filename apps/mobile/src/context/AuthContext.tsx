import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { authService } from "@/services/auth.service";
import { storageService, StorageKey } from "@/services/storage.service";
import { tokenStore } from "@/services/tokenStore";
import { apiClient } from "@/services/api.service";
import type { AuthUser, AuthState } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";
import { authEvents } from "@/utils/authEvents";

interface AuthContextValue {
  user: AuthUser | null;
  authState: AuthState;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  setPurchasing: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  authState: "unauthenticated",
  isLoading: true,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
  continueAsGuest: () => {},
  setPurchasing: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>("unauthenticated");
  const [isLoading, setIsLoading] = useState(true);
  const isPurchasing = useRef(false);

  // Clear session state and storage in one place
  const handleUnauthorized = useCallback(async () => {
    if (isPurchasing.current) {
      logger.debug("Skipping unauthorized state wipe during purchase flow");
      return;
    }
    logger.warn("Handling unauthorized event — clearing session");
    tokenStore.clear();
    await storageService.clearAuthData();
    setUser(null);
    setAuthState("unauthenticated");
  }, []);

  useEffect(() => {
    restoreSession();
  }, []);

  // Listen for 401 Unauthorized events emitted from apiClient
  useEffect(() => {
    const unsubscribe = authEvents.onUnauthorized(() => {
      handleUnauthorized();
    });
    return () => unsubscribe();
  }, [handleUnauthorized]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active" && authState === "authenticated") {
          if (isPurchasing.current) {
            logger.debug(
              "AppState active — skipping session check during purchase",
            );
            return;
          }

          authService.getSession().then((session) => {
            if (!session?.user) {
              logger.warn("Session expired in background — logging out");
              handleUnauthorized();
            }
          });
        }
      },
    );
    return () => subscription.remove();
  }, [authState, handleUnauthorized]);

  async function restoreSession() {
    try {
      const storedToken = await storageService.get(StorageKey.AUTH_TOKEN);

      if (!storedToken) {
        logger.debug("No stored token — unauthenticated");
        setAuthState("unauthenticated");
        return;
      }

      tokenStore.set(storedToken);
      logger.debug("Token restored to memory from SecureStore");

      const { data } = await apiClient.get("/auth/get-session");

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
        await handleUnauthorized();
      }
    } catch (error) {
      logger.error("Session restore failed:", error);
      tokenStore.clear();
      setAuthState("unauthenticated");
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const session = await authService.login({ email, password });
    setUser(session.user);
    setAuthState("authenticated");
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const session = await authService.signUp({
        name,
        email,
        password,
      });
      setUser(session.user);
      setAuthState("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    if (__DEV__) {
      console.trace("🔎 LOGOUT TRIGGERED FROM:");
    }
    try {
      if (authState === "authenticated") {
        await authService.logout();
      }
    } catch {
      // Always clear even if API fails
    } finally {
      await handleUnauthorized();
    }
  }, [authState, handleUnauthorized]);

  const continueAsGuest = useCallback(() => {
    setAuthState("guest");
  }, []);

  const setPurchasing = useCallback((value: boolean) => {
    isPurchasing.current = value;
    logger.debug("Purchase lock set to:", value);
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
        setPurchasing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  return useContext(AuthContext);
}
