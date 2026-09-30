import { prisma } from "../../config/database";
import { AppError } from "../../shared/utils/appError.js";

export const addToWatchlist = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.watchlist.create({
    data: {
      userId,
      movieId: movie.id,
    },
    include: {
      movie: true,
    },
  });
};

export const removeFromWatchlist = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existing = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });

  if (!existing) {
    throw new AppError("Movie is not in watchlist", 404);
  }

  await prisma.watchlist.delete({
    where: {
      id: existing.id,
    },
  });

  return {
    message: "Movie removed from watchlist",
  };
};

export const getWatchlist = async (userId: string) => {
  return prisma.watchlist.findMany({
    where: {
      userId,
    },
    include: {
      movie: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const checkWatchlist = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    return false;
  }

  const watchlistItem = await prisma.watchlist.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });

  return Boolean(watchlistItem);
};