import axios from "axios";

import { AppError } from "../../shared/utils/appError";

export const handleTMDBError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const code = error.code;

    // Log only operational details; avoid logging raw response bodies
    // or request configuration that could contain sensitive information.
    console.error("TMDB request failed", {
      code,
      status,
      message: error.message,
    });

    if (status === 401 || status === 403) {
      throw new AppError("TMDB authentication failed", 502);
    }

    if (status === 429) {
      throw new AppError("Movie service is temporarily rate-limited", 503);
    }

    if (status === 400) {
      throw new AppError("Invalid movie service request", 502);
    }

    if (status === 404) {
      throw new AppError("Requested movie information was not found", 404);
    }

    if (status !== undefined && status >= 500) {
      throw new AppError("Movie service is temporarily unavailable", 503);
    }

    if (code === "ECONNABORTED" || code === "ETIMEDOUT") {
      throw new AppError("Movie service request timed out", 504);
    }

    if (
      code === "ECONNRESET" ||
      code === "ECONNREFUSED" ||
      code === "ENOTFOUND" ||
      code === "EAI_AGAIN" ||
      !error.response
    ) {
      throw new AppError("Unable to connect to the movie service", 503);
    }
  }

  console.error("Unexpected movie service error", {
    message: error instanceof Error ? error.message : "Unknown error",
  });

  throw new AppError("Failed to fetch movie information", 502);
};
