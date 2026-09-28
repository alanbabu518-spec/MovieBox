import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import {
  createOrUpdateRating,
  getMovieRatingStats,
} from "../services/rating.service.js";
import { createRatingSchema } from "../validators/rating.validator.js";
import { AppError } from "../utils/appError.js";

export const rateMovie = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  if (!req.userId) {
    throw new AppError("Authentication required", 401);
  }

  const { value } = createRatingSchema.parse(
    req.body,
  );

  const rating = await createOrUpdateRating(
    req.userId,
    tmdbId,
    value,
  );

  res.status(200).json({
    success: true,
    data: rating,
  });
};

export const getRatingStats = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const stats = await getMovieRatingStats(
    tmdbId,
    req.userId,
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
};