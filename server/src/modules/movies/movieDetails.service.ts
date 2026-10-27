import { tmdbClient } from "../../integrations/tmdb/tmdb.service";
import {
  handleTMDBError,
} from "../../integrations/tmdb/tmdbRequest.service.js";
import {
  getCachedJson,
  setCachedJson,
} from "../../shared/utils/cache.js";
import {
  TMDBCredits,
  TMDBImagesResponse,
  TMDBMovieDetails,
  TMDBSimilarMoviesResponse,
  TMDBVideosResponse,
  TMDBWatchProvidersResponse,
} from "../../shared/types/tmdb.js";

// Get complete movie details
export const getMovieDetails = async (tmdbId: number) => {
  try {
    const [
      movieResponse,
      creditsResponse,
      videosResponse,
      similarResponse,
      recommendationsResponse,
    ] = await Promise.all([
      tmdbClient.get<TMDBMovieDetails>(`/movie/${tmdbId}`),
      tmdbClient.get<TMDBCredits>(`/movie/${tmdbId}/credits`),
      tmdbClient.get<TMDBVideosResponse>(`/movie/${tmdbId}/videos`),
      tmdbClient.get<TMDBSimilarMoviesResponse>(
        `/movie/${tmdbId}/similar`,
      ),
      tmdbClient.get<TMDBSimilarMoviesResponse>(
        `/movie/${tmdbId}/recommendations`,
      ),
    ]);

    const similar = similarResponse.data.results.length > 0
      ? similarResponse.data
      : recommendationsResponse.data;

    return {
      ...movieResponse.data,
      credits: creditsResponse.data,
      videos: {
        results: videosResponse.data.results,
      },
      similar: {
        page: similar.page,
        total_pages: similar.total_pages,
        total_results: similar.total_results,
        results: similar.results,
      },
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};

// Get movie credits
export const getMovieCredits = async (tmdbId: number) => {
  try {
    const response = await tmdbClient.get<TMDBCredits>(
      `/movie/${tmdbId}/credits`,
    );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

// Get movie videos
export const getMovieVideos = async (tmdbId: number) => {
  try {
    const response = await tmdbClient.get<TMDBVideosResponse>(
      `/movie/${tmdbId}/videos`,
    );

    return response.data.results;
  } catch (error) {
    return handleTMDBError(error);
  }
};

// Get movie images
export const getMovieImages = async (tmdbId: number) => {
  try {
    const response = await tmdbClient.get<TMDBImagesResponse>(
      `/movie/${tmdbId}/images`,
    );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

// Get similar movies, falling back to recommendations when necessary
export const getSimilarMovies = async (tmdbId: number) => {
  try {
    const [similarResponse, recommendationsResponse] =
      await Promise.all([
        tmdbClient.get<TMDBSimilarMoviesResponse>(
          `/movie/${tmdbId}/similar`,
        ),
        tmdbClient.get<TMDBSimilarMoviesResponse>(
          `/movie/${tmdbId}/recommendations`,
        ),
      ]);

    const result = similarResponse.data.results.length > 0
      ? similarResponse.data
      : recommendationsResponse.data;

    return {
      page: result.page,
      totalPages: result.total_pages,
      totalResults: result.total_results,
      movies: result.results,
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};

// Get movie watch providers
export const getMovieWatchProviders = async (tmdbId: number) => {
  try {
    const response = await tmdbClient.get<TMDBWatchProvidersResponse>(
      `/movie/${tmdbId}/watch/providers`,
    );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

// TMDB audience reviews
export interface TMDBMovieReview {
  id: string;
  author: string;
  author_details: {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
  };
  content: string;
  created_at: string;
  updated_at: string;
  url: string;
}

export interface TMDBMovieReviewsResponse {
  id: number;
  page: number;
  results: TMDBMovieReview[];
  total_pages: number;
  total_results: number;
}

const TMDB_REVIEWS_CACHE_TTL_SECONDS = 6 * 60 * 60;

// Get TMDB audience reviews with caching
export const getMovieTMDBReviews = async (
  tmdbId: number,
  page = 1,
): Promise<TMDBMovieReviewsResponse> => {
  const cacheKey = `moviebox:cache:tmdb-reviews:${tmdbId}:page:${page}`;

  const cached =
    await getCachedJson<TMDBMovieReviewsResponse>(cacheKey);

  if (cached !== null) {
    return cached;
  }

  try {
    const response = await tmdbClient.get<TMDBMovieReviewsResponse>(
      `/movie/${tmdbId}/reviews`,
      {
        params: {
          page,
          language: "en-US",
        },
      },
    );

    await setCachedJson(
      cacheKey,
      response.data,
      TMDB_REVIEWS_CACHE_TTL_SECONDS,
    );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};