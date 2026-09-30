import type { Request, Response, NextFunction } from "express";

import {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist,
  checkWatchlist,
} from "./watchlist.service.js";

import type { AuthenticatedRequest } from "../../shared/types/auth.js";

export const addMovieToWatchlist = async (
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

    const watchlist = await addToWatchlist(userId, tmdbId);

    res.status(201).json({
      success: true,
      data: {
        watchlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeMovieFromWatchlist = async (
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

    const result = await removeFromWatchlist(userId, tmdbId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWatchlist = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;

    const watchlist = await getWatchlist(userId);

    res.json({
      success: true,
      data: {
        watchlist,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getWatchlistStatus = async (
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

    const isInWatchlist = await checkWatchlist(userId, tmdbId);

    res.json({
      success: true,
      data: {
        isInWatchlist,
      },
    });
  } catch (error) {
    next(error);
  }
};