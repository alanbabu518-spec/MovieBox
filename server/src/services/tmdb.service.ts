import axios from "axios";
import { tmdbConfig } from "../config/tmdb.js";
import { cacheConfig } from "../config/cache.js";
import { redis } from "../config/redis.js";
import { normalizeTMDBMovie } from "../utils/movieNormalizer.js";
import { TMDBMovieListResponse } from "../types/tmdb.js";
import { Movie } from "../types/movie.js";
import { handleTMDBError } from "./tmdbRequest.service.js";

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
    handleTMDBError(error);
  }
};

export const getLatestMovies = async () => {
  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/movie/now_playing",
      );

    return {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results.map(
        normalizeTMDBMovie,
      ),
    };
  } catch (error) {
    handleTMDBError(error);
  }
};

export const getUpcomingMovies = async () => {
  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/movie/upcoming",
      );

    return {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results.map(
        normalizeTMDBMovie,
      ),
    };
  } catch (error) {
    handleTMDBError(error);
  }
};

export const searchMovies = async (
  query: string,
  page = 1,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/search/movie",
        {
          params: {
            query,
            page,
          },
        },
      );

    return {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results.map(
        normalizeTMDBMovie,
      ),
    };
  } catch (error) {
    handleTMDBError(error);
  }
};

export const discoverMovies = async (
  page = 1,
): Promise<{
  page: number;
  totalPages: number;
  totalResults: number;
  movies: Movie[];
}> => {
  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            page,
            sort_by: "popularity.desc",
          },
        },
      );

    return {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results.map(
        normalizeTMDBMovie,
      ),
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};