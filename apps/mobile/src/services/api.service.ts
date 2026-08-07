import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { API_CONFIG } from "@/config/api.config";
import { tokenStore } from "@/services/tokenStore";
import { getDeviceFingerprint } from "@/utils/deviceFingerprint";
import { logger } from "@/utils/logger";
import { authEvents } from "@/utils/authEvents";
import type { ApiError } from "@scamshieldlite/shared";

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api`,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers,
});

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const fingerprint = await getDeviceFingerprint();
    config.headers["X-Device-Fingerprint"] = fingerprint;
    config.headers["Origin"] = API_CONFIG.baseURL;

    logger.debug(
      `→ ${config.method?.toUpperCase()} ${config.url} [auth: ${
        token ? "yes" : "no token"
      }]`,
    );

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.debug(`← ${response.status} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const isNetworkError = !error.response;

    if (isNetworkError) {
      logger.error(`← NETWORK ERROR ${url}: ${error.message}`);
      const networkError = new Error(
        "Could not reach the server. Check your connection and try again.",
      );
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    if (status === 401) {
      const isPaymentEndpoint =
        url?.includes("subscription") ||
        url?.includes("verify-purchase") ||
        url?.includes("ensure-trial");

      if (!isPaymentEndpoint) {
        logger.warn(`401 on ${url} — emitting unauthorized event`);
        authEvents.emitUnauthorized(); // <--- Emits event; AuthProvider performs state & storage wipe
      } else {
        logger.warn(
          `401 on payment endpoint ${url} — preserved auth state (purchase flow timing)`,
        );
      }
    }

    logger.error(
      `← ${status} ${url}: ${error.response?.data?.error ?? error.message}`,
    );

    return Promise.reject(error);
  },
);

export { apiClient };
