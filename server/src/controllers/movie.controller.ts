import { Request, Response } from "express";
import { getTrendingMovies } from "../services/tmdb.service.js";

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