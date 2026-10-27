import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

/**
 * Normalized API error that UI components can display safely.
 */
export class ApiError extends Error {
  status: number | undefined;
  code: string | undefined;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Converts Axios errors into consistent, user-friendly errors.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError(error)) {
    return new ApiError("Something went wrong. Please try again.");
  }

  const axiosError = error as AxiosError<{
    message?: string;
    error?: string;
  }>;

  if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
    return new ApiError(
      "The request took too long. Please try again.",
      undefined,
      axiosError.code,
    );
  }

  if (!axiosError.response) {
    return new ApiError(
      "Unable to connect to the server. Check your internet connection and try again.",
      undefined,
      axiosError.code,
    );
  }

  const status = axiosError.response.status;

  const serverMessage =
    axiosError.response.data?.message ?? axiosError.response.data?.error;

  switch (status) {
    case 400:
      return new ApiError(
        serverMessage || "Please check the information you entered.",
        status,
      );

    case 401:
      return new ApiError(
        serverMessage || "Please sign in to continue.",
        status,
      );

    case 403:
      return new ApiError(
        serverMessage || "You don't have permission to perform this action.",
        status,
      );

    case 404:
      return new ApiError(
        serverMessage || "The requested resource could not be found.",
        status,
      );

    case 429:
      return new ApiError(
        "Too many requests. Please wait a moment and try again.",
        status,
      );

    default:
      if (status >= 500) {
        return new ApiError(
          "The server is temporarily unavailable. Please try again later.",
          status,
        );
      }

      return new ApiError(
        serverMessage || "The request failed. Please try again.",
        status,
      );
  }
}

/**
 * Keeps request configuration typed for future request interceptors.
 */
api.interceptors.request.use((config: InternalAxiosRequestConfig) => config);

/**
 * Normalize rejected requests centrally.
 *
 * Requests still reject, so existing try/catch blocks continue to work.
 */
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(normalizeApiError(error)),
);

export default api;
