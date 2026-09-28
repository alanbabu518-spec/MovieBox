import { Response } from "express";
import { AuthenticatedRequest } from "../../shared/types/auth";
import { AppError } from "../../shared/utils/appError";
import { askMovieAI } from "./ai.service.js";
import { getMovieDetails } from "../movies/movieDetails.service";

export const askMovieAssistant = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  if (!req.userId) {
    throw new AppError("Authentication required", 401);
  }

  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const question =
    typeof req.body?.question === "string"
      ? req.body.question.trim()
      : "";

  if (!question) {
    throw new AppError("Question is required", 400);
  }

  const movie = await getMovieDetails(tmdbId);

  const response = await askMovieAI({
    movieTitle: movie.title,
    overview: movie.overview,
    question,
  });

  res.status(200).json({
    success: true,
    data: response,
  });
};