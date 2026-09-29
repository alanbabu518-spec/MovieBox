import axios from "axios";
import https from "https";

import { tmdbConfig } from "../../config/tmdb";
import { cacheConfig } from "../../config/cache.js";
import { redis } from "../../config/redis.js";
import { normalizeTMDBMovie } from "../../shared/utils/movieNormalizer";
import { TMDBMovieListResponse } from "../../shared/types/tmdb";
import { handleTMDBError } from "../../integrations/tmdb/tmdbRequest.service";
import {
  movieIndustries,
  type MovieIndustry,
} from "./industry.js";

const TRENDING_MOVIES_CACHE_KEY =
  "moviebox:cache:movies:trending";

const tmdbHttpsAgent = new https.Agent({
  keepAlive: false,
  family: 4,
});

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  params: {
    api_key: tmdbConfig.apiKey,
  },
  timeout: 15000,
  httpsAgent: tmdbHttpsAgent,
  headers: {
    Accept: "application/json",
  },
});

export interface MovieFilterParams {
  genre?: string;
  language?: string;
  year?: string;
  minRating?: string;
  page?: number;
}

function hasFilters(
  params: MovieFilterParams,
) {
  return Boolean(
    params.genre ||
      params.language ||
      params.year ||
      params.minRating,
  );
}

function buildFilterCacheKey(
  category: string,
  params: MovieFilterParams,
) {
  return [
    "moviebox:cache:movies",
    category,
    params.genre || "all",
    params.language || "all",
    params.year || "all",
    params.minRating || "all",
    params.page || 1,
  ].join(":");
}

function buildDiscoverParams(
  params: MovieFilterParams,
) {
  return {
    page: params.page || 1,
    include_adult: false,
    include_video: false,
    with_genres:
      params.genre || undefined,
    with_original_language:
      params.language || undefined,
    primary_release_year:
      params.year || undefined,
    "vote_average.gte":
      params.minRating || undefined,
  };
}

export const getTrendingMovies = async (
  params: MovieFilterParams = {},
) => {
  if (!hasFilters(params)) {
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
        totalPages:
          response.data.total_pages,
        totalResults:
          response.data.total_results,
        movies:
          response.data.results.map(
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
      console.error(
        "TMDB trending movies request failed:",
        error,
      );

      return handleTMDBError(error);
    }
  }

  const cacheKey = buildFilterCacheKey(
    "trending",
    params,
  );

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            ...buildDiscoverParams(params),
            sort_by: "popularity.desc",
          },
        },
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      cacheConfig.trendingMoviesTtl,
    );

    return result;
  } catch (error) {
    console.error(
      "TMDB filtered trending movies request failed:",
      error,
    );

    return handleTMDBError(error);
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
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };
  } catch (error) {
    console.error(
      "TMDB latest movies request failed:",
      error,
    );

    return handleTMDBError(error);
  }
};

export const getUpcomingMovies = async (
  params: MovieFilterParams = {},
) => {
  if (!hasFilters(params)) {
    try {
      const response =
        await tmdbClient.get<TMDBMovieListResponse>(
          "/movie/upcoming",
        );

      return {
        page: response.data.page,
        totalPages:
          response.data.total_pages,
        totalResults:
          response.data.total_results,
        movies:
          response.data.results.map(
            normalizeTMDBMovie,
          ),
      };
    } catch (error) {
      console.error(
        "TMDB upcoming movies request failed:",
        error,
      );

      return handleTMDBError(error);
    }
  }

  const cacheKey = buildFilterCacheKey(
    "upcoming",
    params,
  );

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            ...buildDiscoverParams(params),
            sort_by:
              "primary_release_date.asc",
            "primary_release_date.gte":
              today,
          },
        },
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    console.error(
      "TMDB filtered upcoming movies request failed:",
      error,
    );

    return handleTMDBError(error);
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
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };
  } catch (error) {
    console.error(
      "TMDB movie search request failed:",
      error,
    );

    return handleTMDBError(error);
  }
};

export async function getIndustryTrendingMovies(
  industry: MovieIndustry,
) {
  const config = movieIndustries[industry];

  const cacheKey =
    `moviebox:cache:movies:trending:${industry}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            with_original_language:
              config.language,
            region: config.region,
            sort_by: "popularity.desc",
            include_adult: false,
            include_video: false,
            page: 1,
          },
        },
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    console.error(
      `TMDB industry request failed for ${industry}:`,
      error,
    );

    return handleTMDBError(error);
  }
}

export const getPopularMovies = async (
  params: MovieFilterParams = {},
) => {
  const cacheKey = buildFilterCacheKey(
    "popular",
    params,
  );

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            ...buildDiscoverParams(params),
            sort_by: "popularity.desc",
          },
        },
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    console.error(
      "TMDB popular movies request failed:",
      error,
    );

    return handleTMDBError(error);
  }
};

export async function discoverMovies(
  params: MovieFilterParams,
) {
  const {
    genre,
    language,
    year,
    minRating,
    page = 1,
  } = params;

  const cacheKey = [
    "moviebox:cache:movies:discover",
    genre || "all",
    language || "all",
    year || "all",
    minRating || "all",
    page,
  ].join(":");

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            page,
            sort_by: "popularity.desc",
            include_adult: false,
            include_video: false,
            with_genres:
              genre || undefined,
            with_original_language:
              language || undefined,
            primary_release_year:
              year || undefined,
            "vote_average.gte":
              minRating || undefined,
          },
        },
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies:
        response.data.results.map(
          normalizeTMDBMovie,
        ),
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    console.error(
      "TMDB discover movies request failed:",
      error,
    );

    return handleTMDBError(error);
  }
};