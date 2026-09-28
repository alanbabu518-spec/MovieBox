import axios from "axios";
import { tmdbConfig } from "../config/tmdb.js";
import { cacheConfig } from "../config/cache.js";
import { redis } from "../config/redis.js";
import { AppError } from "../utils/appError.js";
import { normalizeTMDBMovie } from "../utils/movieNormalizer.js";
import { TMDBMovieListResponse } from "../types/tmdb.js";

const TRENDING_MOVIES_CACHE_KEY =
  "moviebox:cache:movies:trending";

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  params: {
    api_key: tmdbConfig.apiKey,
  },
  timeout: 10000,
});

export const getTrendingMovies = async () => {
  const cachedMovies = await redis.get(
    TRENDING_MOVIES_CACHE_KEY,
  );

  if (cachedMovies) {
    return JSON.parse(cachedMovies);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/trending/movie/week",
      );

    const result = {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results.map(
        normalizeTMDBMovie,
      ),
    };

    await redis.set(
      TRENDING_MOVIES_CACHE_KEY,
      JSON.stringify(result),
      "EX",
      cacheConfig.trendingMoviesTtl,
    );

    return result;
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