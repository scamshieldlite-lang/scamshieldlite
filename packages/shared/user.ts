export type AuthState = "guest" | "authenticated";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface UserSession {
  user: AuthUser;
  token: string;
  expiresAt: string;
  refreshToken?: string;
}
