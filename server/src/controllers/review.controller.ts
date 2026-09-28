import { Request, Response } from "express";
import {
  createReview,
  getMovieReviews,
} from "../services/review.service.js";
import { createReviewSchema } from "../validators/review.validator.js";
import { AppError } from "../utils/appError.js";
import { AuthenticatedRequest } from "../types/auth.js";

export const addReview = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const { content, rating } =
    createReviewSchema.parse(req.body);

  if (!req.userId) {
    throw new AppError("Authentication required", 401);
  }

  const review = await createReview(
    req.userId,
    tmdbId,
    content,
    rating,
  );

  res.status(201).json({
    success: true,
    data: review,
  });
};

export const getReviews = async (
  req: Request,
  res: Response,
) => {
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