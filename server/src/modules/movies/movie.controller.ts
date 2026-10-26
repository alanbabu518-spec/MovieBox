import { Request, Response } from "express";

import {
  discoverMovies,
  getLatestMovies,
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies,
} from "../../integrations/tmdb/tmdb.service";

import {
  autocompleteMoviesSchema,
  searchMoviesSchema,
} from "../movies/movie.validator.js";

import { getMovieSuggestions } from "../movies/autocomplete.service.js";
import { ingestMovieCatalog } from "../movies/movieCatalog.service.js";

import {
  getMovieCredits,
  getMovieDetails,
  getMovieImages,
  getMovieVideos,
  getMovieWatchProviders,
  getSimilarMovies,
} from "../movies/movieDetails.service";

import { AppError } from "../../shared/utils/appError.js";

const currentYear = new Date().getFullYear();

function getMovieFilters(req: Request) {
  const params: {
    genre?: string;
    language?: string;
    year?: string;
    minRating?: string;
    page?: number;
  } = {};

  const { genre, language, year, minRating, page } =
    req.query;

  if (genre !== undefined) {
    if (
      typeof genre !== "string" ||
      !/^\d{1,3}$/.test(genre) ||
      Number(genre) < 1
    ) {
      throw new AppError("Invalid genre filter", 400);
    }

    params.genre = genre;
  }

  if (language !== undefined) {
    if (
      typeof language !== "string" ||
      !/^[a-zA-Z]{2,3}(?:-[a-zA-Z]{2})?$/.test(language)
    ) {
      throw new AppError("Invalid language filter", 400);
    }

    params.language = language;
  }

  if (year !== undefined) {
    if (
      typeof year !== "string" ||
      !/^\d{4}$/.test(year) ||
      Number(year) < 1888 ||
      Number(year) > currentYear + 5
    ) {
      throw new AppError("Invalid year filter", 400);
    }

    params.year = year;
  }

  if (minRating !== undefined) {
    if (
      typeof minRating !== "string" ||
      !/^(?:10(?:\.0)?|[0-9](?:\.\d{1,2})?)$/.test(minRating) ||
      Number(minRating) < 0 ||
      Number(minRating) > 10
    ) {
      throw new AppError(
        "Minimum rating must be between 0 and 10",
        400,
      );
    }

    params.minRating = minRating;
  }

  if (page !== undefined) {
    if (
      typeof page !== "string" ||
      !/^\d+$/.test(page)
    ) {
      throw new AppError("Invalid page number", 400);
    }

    const parsedPage = Number(page);

    if (
      !Number.isSafeInteger(parsedPage) ||
      parsedPage < 1 ||
      parsedPage > 500
    ) {
      throw new AppError(
        "Page must be between 1 and 500",
        400,
      );
    }

    params.page = parsedPage;
  }

  return params;
}

export const getTrending = async (
  req: Request,
  res: Response,
) => {
  const filters = getMovieFilters(req);
  const movies = await getTrendingMovies(filters);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getLatest = async (
  _req: Request,
  res: Response,
) => {
  const movies = await getLatestMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getPopular = async (
  req: Request,
  res: Response,
) => {
  const filters = getMovieFilters(req);
  const movies = await getPopularMovies(filters);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getUpcoming = async (
  req: Request,
  res: Response,
) => {
  const filters = getMovieFilters(req);
  const movies = await getUpcomingMovies(filters);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const search = async (
  req: Request,
  res: Response,
) => {
  const { query, page } = searchMoviesSchema.parse(req.query);
  const movies = await searchMovies(query, page);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const autocomplete = (
  req: Request,
  res: Response,
) => {
  const { query, limit } =
    autocompleteMoviesSchema.parse(req.query);

  const suggestions = getMovieSuggestions(query, limit);

  res.status(200).json({
    success: true,
    data: suggestions,
  });
};

export const ingestCatalog = async (
  _req: Request,
  res: Response,
) => {
  const result = await ingestMovieCatalog(5);

  res.status(200).json({
    success: true,
    data: result,
  });
};

function getValidMovieId(req: Request): number {
  const rawId = req.params.tmdbId;

  if (
    typeof rawId !== "string" ||
    !/^[1-9]\d*$/.test(rawId)
  ) {
    throw new AppError("Invalid movie ID", 400);
  }

  const tmdbId = Number(rawId);

  if (!Number.isSafeInteger(tmdbId)) {
    throw new AppError("Invalid movie ID", 400);
  }

  return tmdbId;
}

export const getDetails = async (
  req: Request,
  res: Response,
) => {
  const movie = await getMovieDetails(getValidMovieId(req));

  res.status(200).json({
    success: true,
    data: movie,
  });
};

export const getCredits = async (
  req: Request,
  res: Response,
) => {
  const credits = await getMovieCredits(getValidMovieId(req));

  res.status(200).json({
    success: true,
    data: credits,
  });
};

export const getVideos = async (
  req: Request,
  res: Response,
) => {
  const videos = await getMovieVideos(getValidMovieId(req));

  res.status(200).json({
    success: true,
    data: videos,
  });
};

export const getImages = async (
  req: Request,
  res: Response,
) => {
  const images = await getMovieImages(getValidMovieId(req));

  res.status(200).json({
    success: true,
    data: images,
  });
};

export const getSimilar = async (
  req: Request,
  res: Response,
) => {
  const movies = await getSimilarMovies(getValidMovieId(req));

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getWatchProviders = async (
  req: Request,
  res: Response,
) => {
  const providers = await getMovieWatchProviders(
    getValidMovieId(req),
  );

  res.status(200).json({
    success: true,
    data: providers,
  });
};

export const getDiscover = async (
  req: Request,
  res: Response,
) => {
  const params = getMovieFilters(req);
  const movies = await discoverMovies(params);

  res.status(200).json({
    success: true,
    data: movies,
  });
};
