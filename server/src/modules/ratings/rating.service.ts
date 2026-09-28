import { prisma } from "../../config/database.js";
import { getOrCreateMovie } from "../movies/movie.service.js";

export const createOrUpdateRating = async (
  userId: string,
  tmdbId: number,
  value: number,
) => {
  const movie = await getOrCreateMovie(tmdbId);

  return prisma.rating.upsert({
    where: {
      userId_movieId: {
        userId,
        movieId: movie.id,
      },
    },
    update: {
      value,
    },
    create: {
      userId,
      movieId: movie.id,
      value,
    },
  });
};

export const getMovieRatingStats = async (
  tmdbId: number,
  userId?: string,
) => {
  const movie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
  });

  if (!movie) {
    return {
      average: 0,
      total: 0,
      distribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
      userRating: null,
    };
  }

  const ratings = await prisma.rating.findMany({
    where: {
      movieId: movie.id,
    },
    select: {
      value: true,
      userId: true,
    },
  });

  const total = ratings.length;

  const average =
    total > 0
      ? ratings.reduce(
          (sum, rating) => sum + rating.value,
          0,
        ) / total
      : 0;

  const distribution = {
    1: ratings.filter((rating) => rating.value === 1).length,
    2: ratings.filter((rating) => rating.value === 2).length,
    3: ratings.filter((rating) => rating.value === 3).length,
    4: ratings.filter((rating) => rating.value === 4).length,
    5: ratings.filter((rating) => rating.value === 5).length,
  };

  const userRating = userId
    ? ratings.find(
        (rating) => rating.userId === userId,
      )?.value ?? null
    : null;

  return {
    average: Number(average.toFixed(2)),
    total,
    distribution,
    userRating,
  };
};