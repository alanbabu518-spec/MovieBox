import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/types/auth.js";

import { createOrUpdateRating, getMovieRatingStats } from "./rating.service.js";

import { createRatingSchema } from "./rating.validator.js";

import { AppError } from "../../shared/utils/appError.js";

export const rateMovie = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const { value } = createRatingSchema.parse(req.body);

  const rating = await createOrUpdateRating(userId, tmdbId, value);

  res.status(200).json({
    success: true,
    data: rating,
  });
};

export const getRatingStats = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const stats = await getMovieRatingStats(tmdbId, userId);

  res.status(200).json({
    success: true,
    data: stats,
  });
};
