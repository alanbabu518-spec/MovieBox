import axios from "axios";
import { AppError } from "../utils/appError.js";

export const handleTMDBError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      throw new AppError(
        "TMDB authentication failed",
        502,
      );
    }

    if (error.response?.status === 429) {
      throw new AppError(
        "TMDB rate limit exceeded",
        503,
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new AppError(
        "TMDB request timed out",
        504,
      );
    }
  }

  throw new AppError(
    "Failed to fetch movies from TMDB",
    502,
  );
};