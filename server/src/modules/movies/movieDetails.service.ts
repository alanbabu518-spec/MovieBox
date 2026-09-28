import { tmdbClient } from "../../integrations/tmdb/tmdb.service";
import { handleTMDBError } from "../../integrations/tmdb/tmdbRequest.service.js";
import {
  TMDBCredits,
  TMDBImagesResponse,
  TMDBMovieDetails,
  TMDBSimilarMoviesResponse,
  TMDBVideosResponse,
  TMDBWatchProvidersResponse,
} from "../../shared/types/tmdb.js";

export const getMovieDetails = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBMovieDetails>(
        `/movie/${tmdbId}`,
      );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

export const getMovieCredits = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBCredits>(
        `/movie/${tmdbId}/credits`,
      );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

export const getMovieVideos = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBVideosResponse>(
        `/movie/${tmdbId}/videos`,
      );

    return response.data.results;
  } catch (error) {
    return handleTMDBError(error);
  }
};

export const getMovieImages = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBImagesResponse>(
        `/movie/${tmdbId}/images`,
      );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};

export const getSimilarMovies = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBSimilarMoviesResponse>(
        `/movie/${tmdbId}/similar`,
      );

    return {
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      movies: response.data.results,
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};

export const getMovieWatchProviders = async (
  tmdbId: number,
) => {
  try {
    const response =
      await tmdbClient.get<TMDBWatchProvidersResponse>(
        `/movie/${tmdbId}/watch/providers`,
      );

    return response.data;
  } catch (error) {
    return handleTMDBError(error);
  }
};