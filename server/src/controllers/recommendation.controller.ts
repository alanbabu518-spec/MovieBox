import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth.js";
import { AppError } from "../utils/appError.js";
import { getRecommendedMovies } from "../services/recommendation.service.js";

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.userId) {
    throw new AppError("Authentication required", 401);
  }

  const recommendations =
    await getRecommendedMovies(req.userId);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
};