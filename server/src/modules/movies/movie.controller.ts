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

function getMovieFilters(
  req: Request,
) {
  const params: {
    genre?: string;
    language?: string;
    year?: string;
    minRating?: string;
    page?: number;
  } = {};

  if (
    typeof req.query.genre === "string"
  ) {
    params.genre = req.query.genre;
  }

  if (
    typeof req.query.language === "string"
  ) {
    params.language =
      req.query.language;
  }

  if (
    typeof req.query.year === "string"
  ) {
    params.year = req.query.year;
  }

  if (
    typeof req.query.minRating ===
    "string"
  ) {
    params.minRating =
      req.query.minRating;
  }

  if (
    typeof req.query.page === "string"
  ) {
    const page = Number(
      req.query.page,
    );

    if (
      Number.isInteger(page) &&
      page > 0
    ) {
      params.page = page;
    }
  }

  return params;
}

export const getTrending = async (
  req: Request,
  res: Response,
) => {
  const filters =
    getMovieFilters(req);

  const movies =
    await getTrendingMovies(filters);

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
  const filters =
    getMovieFilters(req);

  const movies =
    await getPopularMovies(filters);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getUpcoming = async (
  req: Request,
  res: Response,
) => {
  const filters =
    getMovieFilters(req);

  const movies =
    await getUpcomingMovies(filters);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const search = async (
  req: Request,
  res: Response,
) => {
  const { query, page } =
    searchMoviesSchema.parse(req.query);

  const movies = await searchMovies(
    query,
    page,
  );

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
    autocompleteMoviesSchema.parse(
      req.query,
    );

  const suggestions = getMovieSuggestions(
    query,
    limit,
  );

  res.status(200).json({
    success: true,
    data: suggestions,
  });
};

export const ingestCatalog = async (
  _req: Request,
  res: Response,
) => {
  const result =
    await ingestMovieCatalog(5);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getDetails = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(
    req.params.tmdbId,
  );

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const movie =
    await getMovieDetails(tmdbId);

  res.status(200).json({
    success: true,
    data: movie,
  });
};

export const getCredits = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(
    req.params.tmdbId,
  );

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const credits =
    await getMovieCredits(tmdbId);

  res.status(200).json({
    success: true,
    data: credits,
  });
};

export const getVideos = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(
    req.params.tmdbId,
  );

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const videos =
    await getMovieVideos(tmdbId);

  res.status(200).json({
    success: true,
    data: videos,
  });
};

export const getImages = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(
    req.params.tmdbId,
  );

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const images =
    await getMovieImages(tmdbId);

  res.status(200).json({
    success: true,
    data: images,
  });
};

export const getSimilar = async (
  req: Request,
  res: Response,
) => {
  const tmdbId = Number(
    req.params.tmdbId,
  );

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const movies =
    await getSimilarMovies(tmdbId);

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getWatchProviders =
  async (
    req: Request,
    res: Response,
  ) => {
    const tmdbId = Number(
      req.params.tmdbId,
    );

    if (
      !Number.isInteger(tmdbId) ||
      tmdbId <= 0
    ) {
      throw new AppError(
        "Invalid movie ID",
        400,
      );
    }

    const providers =
      await getMovieWatchProviders(
        tmdbId,
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
  const params =
    getMovieFilters(req);

  const movies =
    await discoverMovies(params);

  res.status(200).json({
    success: true,
    data: movies,
  });
};