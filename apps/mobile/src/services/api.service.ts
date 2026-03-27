// apps/mobile/src/services/api.service.ts

import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { API_CONFIG } from "@/config/api.config";
import { storageService, StorageKey } from "@/services/storage.service";
import { getDeviceFingerprint } from "@/utils/deviceFingerprint";
import { logger } from "@/utils/logger";
import type { ApiError } from "@scamshieldlite/shared/";

// Create the shared Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api`,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

// ── Request interceptor ───────────────────────────────────────────
// Attaches auth token + device fingerprint to every request
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Auth token
    const token = await storageService.get(StorageKey.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Device fingerprint — sent on every request for rate limiting
    const fingerprint = await getDeviceFingerprint();
    config.headers["X-Device-Fingerprint"] = fingerprint;

    logger.debug(`→ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ─────────────────────────────────────────
// Extracts rate limit headers and handles 401s
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`← ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    // Token expired — clear auth and let AuthContext handle redirect
    if (status === 401) {
      await storageService.clearAuthData();
    }

    logger.error(
      `← ${status} ${error.config?.url}: ${error.response?.data?.error ?? error.message}`,
    );

    return Promise.reject(error);
  },
);

export { apiClient };
