import type { ApiError } from "@scamshieldlite/shared/";
import type { AxiosError } from "axios";

export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;

  // 1. Prioritize Backend "Brand" Errors (e.g., "Daily limit reached")
  if (axiosError?.response?.data?.error) {
    return axiosError.response.data.error;
  }

  // 2. Handle Network-Level Errors (Lagos/Weak Connection scenario)
  if (
    axiosError?.code === "ECONNABORTED" ||
    axiosError?.message?.includes("timeout")
  ) {
    return "Connection timed out. Please check your internet and try again.";
  }

  if (axiosError?.message === "Network Error") {
    return "Network error. Please ensure you're connected to data or Wi-Fi.";
  }

  // 3. Fallback to generic message
  return (
    axiosError?.message ||
    "An unexpected security error occurred. Please try again."
  );
}
