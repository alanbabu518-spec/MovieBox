import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../shared/types/auth";

import { AppError } from "../../shared/utils/appError.js";

import { getRecommendedMovies } from "./recommendation.service.js";

export const getRecommendations = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const recommendations = await getRecommendedMovies(userId);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
};
