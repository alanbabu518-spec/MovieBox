import { prisma } from "../../config/database.js";
import { getOrCreateMovie } from "../movies/movie.service.js";

export const createReview = async (
  userId: string,
  tmdbId: number,
  content: string,
  rating: number,
) => {
  const movie = await getOrCreateMovie(tmdbId);

  return prisma.review.create({
    data: {
      userId,
      movieId: movie.id,
      content,
      rating,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const getMovieReviews = async (
  tmdbId: number,
) => {
  const movie = await prisma.movie.findUnique({
    where: {
      tmdbId,
    },
  });

  if (!movie) {
    return [];
  }

  return prisma.review.findMany({
    where: {
      movieId: movie.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};