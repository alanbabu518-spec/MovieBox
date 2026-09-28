import { Request, Response } from "express";
import {
  getLatestMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies,
} from "../services/tmdb.service.js";
import {
  autocompleteMoviesSchema,
  searchMoviesSchema,
} from "../validators/movie.validator.js";
import { getMovieSuggestions } from "../services/autocomplete.service.js";
import { ingestMovieCatalog } from "../services/movieCatalog.service.js";
import {
  getMovieCredits,
  getMovieDetails,
  getMovieImages,
  getMovieVideos,
  getMovieWatchProviders,
  getSimilarMovies,
} from "../services/movieDetails.service.js";
import { AppError } from "../utils/appError.js";

export const getTrending = async (_req: Request, res: Response) => {
  const movies = await getTrendingMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getLatest = async (_req: Request, res: Response) => {
  const movies = await getLatestMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getUpcoming = async (_req: Request, res: Response) => {
  const movies = await getUpcomingMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const search = async (req: Request, res: Response) => {
  const { query, page } = searchMoviesSchema.parse(req.query);

  const movies = await searchMovies(query, page);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const autocomplete = (req: Request, res: Response) => {
  const { query, limit } = autocompleteMoviesSchema.parse(req.query);

  const suggestions = getMovieSuggestions(query, limit);

  res.status(200).json({
    success: true,
    data: suggestions,
  });
};

export const ingestCatalog = async (_req: Request, res: Response) => {
  const result = await ingestMovieCatalog(5);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getDetails = async (req: Request, res: Response) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const movie = await getMovieDetails(tmdbId);

  res.status(200).json({
    success: true,
    data: movie,
  });
};

export const getCredits = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const credits = await getMovieCredits(tmdbId);

  res.status(200).json({
    success: true,
    data: credits,
  });
};

export const getVideos = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const videos = await getMovieVideos(tmdbId);

  res.status(200).json({
    success: true,
    data: videos,
  });
};

export const getImages = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const images = await getMovieImages(tmdbId);

  res.status(200).json({
    success: true,
    data: images,
  });
};

export const getSimilar = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const movies = await getSimilarMovies(tmdbId);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getWatchProviders = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const providers =
    await getMovieWatchProviders(tmdbId);

  res.status(200).json({
    success: true,
    data: providers,
  });
};
