import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/auth.js";
import {
  createOrUpdateRating,
  getMovieRatingStats,
} from "./rating.service.js";
import { createRatingSchema } from "./rating.validator.js";
import { AppError } from "../../shared/utils/appError.js";

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