import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  useRef,
} from "react";
import { authService } from "@/services/auth.service";
import { storageService, StorageKey } from "@/services/storage.service";
import type { AuthUser, AuthState } from "@scamshieldlite/shared/";
import { logger } from "@/utils/logger";
import { AppState, type AppStateStatus } from "react-native";

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

  const lastValidation = useRef(Date.now());

  // On mount — restore session from SecureStore
  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const now = Date.now();
        // Only re-validate if it's been more than 5 minutes since the last check
        const shouldCheck = now - lastValidation.current > 5 * 60 * 1000;
        if (
          nextState === "active" &&
          authState === "authenticated" &&
          shouldCheck
        ) {
          lastValidation.current = now;
          authService.getSession().then((session) => {
            if (!session?.user) {
              // Session expired while app was in background
              logger.warn("Session expired in background — logging out");
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
      const token = await storageService.get(StorageKey.AUTH_TOKEN);
      if (!token) {
        setAuthState("unauthenticated");
        return;
      }

      const session = await authService.getSession();
      if (session?.user) {
        setUser(session.user);
        setAuthState("authenticated");
        logger.info("Session restored for user:", session.user.id);
      } else {
        // Token invalid or expired
        await storageService.clearAuthData();
        setAuthState("unauthenticated");
      }
    } catch (error) {
      logger.error("Session restore failed", error);
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
      const session = await authService.signUp({ name, email, password });
      setUser(session.user);
      setAuthState("authenticated");
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setAuthState("unauthenticated");
  }, []);

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
