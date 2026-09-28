import { prisma } from "../../config/database.js";
import { getMovieDetails } from "../movies/movieDetails.service.js";

export const getOrCreateMovie = async (tmdbId: number) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  const tmdbMovie = await getMovieDetails(tmdbId);

  if (existingMovie) {
    return prisma.movie.update({
      where: { id: existingMovie.id },
      data: {
        title: tmdbMovie.title,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        releaseDate: tmdbMovie.release_date
          ? new Date(tmdbMovie.release_date)
          : null,
      },
    });
  }

  return prisma.movie.create({
    data: {
      tmdbId: tmdbMovie.id,
      title: tmdbMovie.title,
      posterPath: tmdbMovie.poster_path,
      backdropPath: tmdbMovie.backdrop_path,
      releaseDate: tmdbMovie.release_date
        ? new Date(tmdbMovie.release_date)
        : null,
    },
  });
};