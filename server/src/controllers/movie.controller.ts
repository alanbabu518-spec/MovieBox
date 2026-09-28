import { Request, Response } from "express";
import {
  getLatestMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../services/tmdb.service.js";

export const getTrending = async (
  _req: Request,
  res: Response,
) => {
  const movies = await getTrendingMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getLatest = async (
  _req: Request,
  res: Response,
) => {
  const movies = await getLatestMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};

export const getUpcoming = async (
  _req: Request,
  res: Response,
) => {
  const movies = await getUpcomingMovies();

  res.status(200).json({
    success: true,
    data: movies,
  });
};