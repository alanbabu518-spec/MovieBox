import { prisma } from "../config/database.js";

export const getRecommendedMovies = async (
  userId: string,
  limit = 10,
) => {
  const [favorites, watchlist, history, ratings] =
    await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        select: {
          movie: {
            select: {
              id: true,
              title: true,
              tmdbId: true,
              posterPath: true,
              backdropPath: true,
            },
          },
        },
      }),

      prisma.watchlist.findMany({
        where: { userId },
        select: {
          movie: {
            select: {
              id: true,
              title: true,
              tmdbId: true,
              posterPath: true,
              backdropPath: true,
            },
          },
        },
      }),

      prisma.watchHistory.findMany({
        where: { userId },
        orderBy: {
          watchedAt: "desc",
        },
        take: 20,
        select: {
          movie: {
            select: {
              id: true,
              title: true,
              tmdbId: true,
              posterPath: true,
              backdropPath: true,
            },
          },
        },
      }),

      prisma.rating.findMany({
        where: {
          userId,
          value: {
            gte: 4,
          },
        },
        select: {
          movie: {
            select: {
              id: true,
              title: true,
              tmdbId: true,
              posterPath: true,
              backdropPath: true,
            },
          },
        },
      }),
    ]);

  const movies = [
    ...favorites.map((item) => item.movie),
    ...watchlist.map((item) => item.movie),
    ...history.map((item) => item.movie),
    ...ratings.map((item) => item.movie),
  ];

  const uniqueMovies = Array.from(
    new Map(
      movies.map((movie) => [movie.id, movie]),
    ).values(),
  );

  return uniqueMovies.slice(0, limit);
};