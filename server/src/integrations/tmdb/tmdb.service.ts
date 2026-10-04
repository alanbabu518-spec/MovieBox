import axios from "axios";

import { tmdbConfig } from "../../config/tmdb";
import { cacheConfig } from "../../config/cache.js";
import { redis } from "../../config/redis.js";
import { normalizeTMDBMovie } from "../../shared/utils/movieNormalizer";
import {
  TMDBGenreListResponse,
  TMDBMovieListResponse,
} from "../../shared/types/tmdb";
import { handleTMDBError } from "../../integrations/tmdb/tmdbRequest.service";
import {
  movieIndustries,
  type MovieIndustry,
} from "./industry.js";

const TRENDING_MOVIES_CACHE_KEY =
  "moviebox:cache:movies:trending";

const MOVIE_GENRES_CACHE_KEY =
  "moviebox:cache:genres:movie";

const MOVIE_GENRES_CACHE_TTL = 86400;

export const tmdbClient = axios.create({
  baseURL: tmdbConfig.baseUrl,
  params: {
    api_key: tmdbConfig.apiKey,
  },
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "User-Agent": "MovieBox/1.0",
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

function logTMDBError(
  operation: string,
  error: unknown,
) {
  if (axios.isAxiosError(error)) {
    console.error(
      `TMDB ${operation} request failed`,
    );

    console.error(
      "TMDB status:",
      error.response?.status,
    );

    console.error(
      "TMDB status text:",
      error.response?.statusText,
    );

    console.error(
      "TMDB response:",
      error.response?.data,
    );

    console.error(
      "TMDB message:",
      error.message,
    );

    console.error(
      "TMDB code:",
      error.code,
    );

    console.error(
      "TMDB URL:",
      error.config?.url,
    );

    console.error(
      "TMDB base URL:",
      error.config?.baseURL,
    );

    console.error(
      "TMDB params:",
      {
        ...error.config?.params,
        api_key: error.config?.params?.api_key
          ? "[hidden]"
          : undefined,
      },
    );

    return;
  }

  console.error(
    `TMDB ${operation} request failed:`,
    error,
  );
}

async function getMovieGenreMap(): Promise<
  Map<number, string>
> {
  const cachedGenres = await redis.get(
    MOVIE_GENRES_CACHE_KEY,
  );

  if (cachedGenres) {
    const genres = JSON.parse(
      cachedGenres,
    ) as {
      id: number;
      name: string;
    }[];

    return new Map(
      genres.map((genre) => [
        genre.id,
        genre.name,
      ]),
    );
  }

  const response =
    await tmdbClient.get<TMDBGenreListResponse>(
      "/genre/movie/list",
      {
        params: {
          language: "en-US",
        },
      },
    );

  const genres = response.data.genres;

  await redis.set(
    MOVIE_GENRES_CACHE_KEY,
    JSON.stringify(genres),
    "EX",
    MOVIE_GENRES_CACHE_TTL,
  );

  return new Map(
    genres.map((genre) => [
      genre.id,
      genre.name,
    ]),
  );
}

async function normalizeMovieResults(
  results: Parameters<
    typeof normalizeTMDBMovie
  >[0][],
) {
  const genreMap =
    await getMovieGenreMap();

  return results.map((movie) =>
    normalizeTMDBMovie(
      movie,
      genreMap,
    ),
  );
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

      const movies =
        await normalizeMovieResults(
          response.data.results,
        );

      const result = {
        page: response.data.page,
        totalPages:
          response.data.total_pages,
        totalResults:
          response.data.total_results,
        movies,
      };

      await redis.set(
        TRENDING_MOVIES_CACHE_KEY,
        JSON.stringify(result),
        "EX",
        cacheConfig.trendingMoviesTtl,
      );

      return result;
    } catch (error) {
      logTMDBError(
        "trending movies",
        error,
      );

      return handleTMDBError(error);
    }
  }

  const cacheKey =
    buildFilterCacheKey(
      "trending",
      params,
    );

  const cached =
    await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        "/discover/movie",
        {
          params: {
            ...buildDiscoverParams(
              params,
            ),
            sort_by: "popularity.desc",
          },
        },
      );

    const movies =
      await normalizeMovieResults(
        response.data.results,
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies,
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      cacheConfig.trendingMoviesTtl,
    );

    return result;
  } catch (error) {
    logTMDBError(
      "filtered trending movies",
      error,
    );

    return handleTMDBError(error);
  }
};

export const getLatestMovies =
  async () => {
    try {
      const response =
        await tmdbClient.get<TMDBMovieListResponse>(
          "/movie/now_playing",
        );

      const movies =
        await normalizeMovieResults(
          response.data.results,
        );

      return {
        page: response.data.page,
        totalPages:
          response.data.total_pages,
        totalResults:
          response.data.total_results,
        movies,
      };
    } catch (error) {
      logTMDBError(
        "latest movies",
        error,
      );

      return handleTMDBError(error);
    }
  };

export const getUpcomingMovies =
  async (
    params: MovieFilterParams = {},
  ) => {
    if (!hasFilters(params)) {
      try {
        const response =
          await tmdbClient.get<TMDBMovieListResponse>(
            "/movie/upcoming",
          );

        const movies =
          await normalizeMovieResults(
            response.data.results,
          );

        return {
          page: response.data.page,
          totalPages:
            response.data.total_pages,
          totalResults:
            response.data.total_results,
          movies,
        };
      } catch (error) {
        logTMDBError(
          "upcoming movies",
          error,
        );

        return handleTMDBError(error);
      }
    }

    const cacheKey =
      buildFilterCacheKey(
        "upcoming",
        params,
      );

    const cached =
      await redis.get(cacheKey);

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
              ...buildDiscoverParams(
                params,
              ),
              sort_by:
                "primary_release_date.asc",
              "primary_release_date.gte":
                today,
            },
          },
        );

      const movies =
        await normalizeMovieResults(
          response.data.results,
        );

      const result = {
        page: response.data.page,
        totalPages:
          response.data.total_pages,
        totalResults:
          response.data.total_results,
        movies,
      };

      await redis.set(
        cacheKey,
        JSON.stringify(result),
        "EX",
        1800,
      );

      return result;
    } catch (error) {
      logTMDBError(
        "filtered upcoming movies",
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

    const movies =
      await normalizeMovieResults(
        response.data.results,
      );

    return {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies,
    };
  } catch (error) {
    logTMDBError(
      "movie search",
      error,
    );

    return handleTMDBError(error);
  }
};

export async function getIndustryTrendingMovies(
  industry: MovieIndustry,
) {
  const config =
    movieIndustries[industry];

  const cacheKey =
    `moviebox:cache:movies:trending:${industry}`;

  const cached =
    await redis.get(cacheKey);

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
            sort_by:
              "popularity.desc",
            include_adult: false,
            include_video: false,
            page: 1,
          },
        },
      );

    const movies =
      await normalizeMovieResults(
        response.data.results,
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies,
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    logTMDBError(
      `industry ${industry}`,
      error,
    );

    return handleTMDBError(error);
  }
}

export const getPopularMovies = async (
  params: MovieFilterParams = {},
) => {
  const cacheKey =
    buildFilterCacheKey(
      "popular",
      params,
    );

  const cached =
    await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  try {
    const response =
      await tmdbClient.get<TMDBMovieListResponse>(
        hasFilters(params)
          ? "/discover/movie"
          : "/movie/popular",
        {
          params: hasFilters(params)
            ? {
                ...buildDiscoverParams(
                  params,
                ),
                sort_by:
                  "popularity.desc",
              }
            : {
                page:
                  params.page || 1,
              },
        },
      );

    const movies =
      await normalizeMovieResults(
        response.data.results,
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies,
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    logTMDBError(
      "popular movies",
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

  const cached =
    await redis.get(cacheKey);

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
            sort_by:
              "popularity.desc",
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

    const movies =
      await normalizeMovieResults(
        response.data.results,
      );

    const result = {
      page: response.data.page,
      totalPages:
        response.data.total_pages,
      totalResults:
        response.data.total_results,
      movies,
    };

    await redis.set(
      cacheKey,
      JSON.stringify(result),
      "EX",
      1800,
    );

    return result;
  } catch (error) {
    logTMDBError(
      "discover movies",
      error,
    );

    return handleTMDBError(error);
  }
}