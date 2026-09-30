import type {
  NextFunction,
  Request,
  Response,
} from "express";

import {
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  checkFavorite,
} from "./favorite.service.js";

import type { AuthenticatedRequest } from "../../middleware/auth.js";

export const addMovieToFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const tmdbId = Number(req.body.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid TMDB movie ID",
      });
      return;
    }

    const favorite = await addToFavorites(
      userId,
      tmdbId,
    );

    res.status(201).json({
      success: true,
      data: {
        favorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeMovieFromFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid TMDB movie ID",
      });
      return;
    }

    const result = await removeFromFavorites(
      userId,
      tmdbId,
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserFavorites = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const favorites = await getFavorites(userId);

    res.json({
      success: true,
      data: {
        favorites,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFavoriteStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const tmdbId = Number(req.params.tmdbId);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid TMDB movie ID",
      });
      return;
    }

    const isFavorite = await checkFavorite(
      userId,
      tmdbId,
    );

    res.json({
      success: true,
      data: {
        isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
};