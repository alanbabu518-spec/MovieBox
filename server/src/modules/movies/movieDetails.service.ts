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

    const similarResults = similarResponse.data.results.length
      ? similarResponse.data.results
      : recommendationsResponse.data.results;

    const similarPage = similarResponse.data.results.length
      ? similarResponse.data.page
      : recommendationsResponse.data.page;

    const similarTotalPages = similarResponse.data.results.length
      ? similarResponse.data.total_pages
      : recommendationsResponse.data.total_pages;

    const similarTotalResults = similarResponse.data.results.length
      ? similarResponse.data.total_results
      : recommendationsResponse.data.total_results;

    return {
      ...movieResponse.data,
      credits: creditsResponse.data,
      videos: {
        results: videosResponse.data.results,
      },
      similar: {
        page: similarPage,
        total_pages: similarTotalPages,
        total_results: similarTotalResults,
        results: similarResults,
      },
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};

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

    const movies = similarResponse.data.results.length
      ? similarResponse.data.results
      : recommendationsResponse.data.results;

    const page = similarResponse.data.results.length
      ? similarResponse.data.page
      : recommendationsResponse.data.page;

    const totalPages = similarResponse.data.results.length
      ? similarResponse.data.total_pages
      : recommendationsResponse.data.total_pages;

    const totalResults = similarResponse.data.results.length
      ? similarResponse.data.total_results
      : recommendationsResponse.data.total_results;

    return {
      page,
      totalPages,
      totalResults,
      movies,
    };
  } catch (error) {
    return handleTMDBError(error);
  }
};

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