import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { API_CONFIG } from "@/config/api.config";
import { storageService, StorageKey } from "@/services/storage.service";
import { tokenStore } from "@/services/tokenStore";
import { getDeviceFingerprint } from "@/utils/deviceFingerprint";
import { logger } from "@/utils/logger";
import type { ApiError } from "@scamshieldlite/shared/";

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Origin: "http://192.168.43.93:3000",
  },
});

// ── Request interceptor ───────────────────────────────────────────
// Reads token from memory — synchronous, no async issues
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Token from memory
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      logger.debug(
        `→ ${config.method?.toUpperCase()} ${config.url} [auth: yes]`,
      );
    } else {
      logger.debug(
        `→ ${config.method?.toUpperCase()} ${config.url} [auth: no token]`,
      );
    }

    // Device fingerprint
    const fingerprint = await getDeviceFingerprint();
    config.headers["X-Device-Fingerprint"] = fingerprint;

    // ← ADD THIS — React Native doesn't send Origin automatically
    // Better Auth requires it for CSRF protection
    // Use the API base URL as the origin
    config.headers["Origin"] = API_CONFIG.baseURL;

    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`← ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const url = error.config?.url;

    if (!error.response) {
      logger.error(`← NETWORK ERROR ${url}: ${error.message}`);
      const networkError = new Error(
        "Could not reach the server. Check your connection and try again.",
      );
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    if (status === 401) {
      // Clear both memory and storage
      tokenStore.clear();
      await storageService.clearAuthData();
    }

    logger.error(
      `← ${status} ${url}: ${error.response?.data?.error ?? error.message}`,
    );

    return Promise.reject(error);
  },
);

export { apiClient };
