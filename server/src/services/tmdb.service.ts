import axios from "axios";
import { tmdbConfig } from "../config/tmdb.js";
import { AppError } from "../utils/appError.js";

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  params: {
    api_key: tmdbConfig.apiKey,
  },
  timeout: 10000,
});

export const getTrendingMovies = async () => {
  try {
    const response = await tmdbClient.get("/trending/movie/week");

    return response.data;
  } catch (error) {
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
  }
};