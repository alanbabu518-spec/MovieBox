import { prisma } from "../../config/database";
import { AppError } from "../../shared/utils/appError.js";

export const addToFavorites = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existing = await prisma.favorite.findUnique({
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

  return prisma.favorite.create({
    data: {
      userId,
      movieId: movie.id,
    },
    include: {
      movie: true,
    },
  });
};

export const removeFromFavorites = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    throw new AppError("Movie not found", 404);
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });

  if (!existing) {
    throw new AppError("Movie is not in favorites", 404);
  }

  await prisma.favorite.delete({
    where: {
      id: existing.id,
    },
  });

  return {
    message: "Movie removed from favorites",
  };
};

export const getFavorites = async (userId: string) => {
  return prisma.favorite.findMany({
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

export const checkFavorite = async (
  userId: string,
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (!movie) {
    return false;
  }

  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
  });

  return Boolean(favorite);
};