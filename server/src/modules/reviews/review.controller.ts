import type { Request, Response } from "express";

import {
  createReview,
  getMovieReviews,
} from "../../modules/reviews/review.service.js";

import { createReviewSchema } from "./review.validator.js";

import { AppError } from "../../shared/utils/appError.js";

import type { AuthenticatedRequest } from "../../shared/types/auth.js";

export const addReview = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const { content, rating } = createReviewSchema.parse(req.body);

  const review = await createReview(userId, tmdbId, content, rating);

  res.status(201).json({
    success: true,
    data: review,
  });
};

export const getReviews = async (req: Request, res: Response) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const reviews = await getMovieReviews(tmdbId);

  res.status(200).json({
    success: true,
    data: reviews,
  });
};
