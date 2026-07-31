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

// ── Fallback URL ──────────────────────────────────────────────────
// Used when the primary URL fails with a network error or 5xx
// Set this to your Render URL when Railway is primary, or vice versa
const FALLBACK_BASE_URL = API_CONFIG.fallbackURL;

// ── Shared request builder ────────────────────────────────────────
// Adds auth token, fingerprint, and Origin header to any config
async function buildRequestHeaders(
  config: InternalAxiosRequestConfig,
  baseURL: string,
): Promise<InternalAxiosRequestConfig> {
  const token = tokenStore.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const fingerprint = await getDeviceFingerprint();
  config.headers["X-Device-Fingerprint"] = fingerprint;

  // Origin header — required by Better Auth for CSRF protection
  // Must match the server's trustedOrigins list
  config.headers["Origin"] = baseURL;

  return config;
}

// ── Primary client ────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Fallback client (separate instance — no shared interceptors) ──
// Only created if FALLBACK_BASE_URL is configured
const fallbackClient: AxiosInstance | null = FALLBACK_BASE_URL
  ? axios.create({
      baseURL: `${FALLBACK_BASE_URL}/api`,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    })
  : null;

// ── Primary request interceptor ───────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      logger.debug(
        `→ ${config.method?.toUpperCase()} ${config.url} [auth: yes]`,
      );
    } else {
      logger.debug(
        `→ ${config.method?.toUpperCase()} ${config.url} [auth: no token]`,
      );
    }
    return buildRequestHeaders(config, API_CONFIG.baseURL);
  },
  (error) => Promise.reject(error),
);

// ── Primary response interceptor ─────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`← ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();

    // ── Network error or server crash → try fallback ──────────────
    const isNetworkError = !error.response;
    const isServerError = status !== undefined && status >= 500;

    if ((isNetworkError || isServerError) && fallbackClient) {
      logger.warn(
        `Primary API failed (${isNetworkError ? "network error" : status}) — trying fallback`,
      );

      try {
        // Rebuild the request against the fallback URL
        // Use the original request config but strip the baseURL
        // so fallbackClient's baseURL is used instead
        const originalConfig = error.config!;

        // Add headers to the fallback request
        const fallbackConfig: InternalAxiosRequestConfig = {
          ...originalConfig,
          baseURL: `${FALLBACK_BASE_URL}/api`,
          headers: originalConfig.headers,
        };

        await buildRequestHeaders(fallbackConfig, FALLBACK_BASE_URL!);

        const fallbackResponse = await fallbackClient.request(fallbackConfig);

        logger.info(`← Fallback succeeded: ${fallbackResponse.status} ${url}`);
        return fallbackResponse;
      } catch (fallbackError) {
        logger.error(
          `← Fallback also failed for ${method} ${url}, error: ${fallbackError}`,
        );
        // Fall through to original error handling below
      }
    }

    // ── No fallback or fallback also failed ───────────────────────
    if (isNetworkError) {
      logger.error(`← NETWORK ERROR ${url}: ${error.message}`);
      const networkError = new Error(
        "Could not reach the server. Check your connection and try again.",
      );
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // 401 — clear auth state
    if (status === 401) {
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
