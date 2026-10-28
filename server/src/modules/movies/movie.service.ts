import { prisma } from "../../config/database.js";
import { getMovieDetails } from "./movieDetails.service.js";

/**
 * Resolve a TMDB movie to a local Movie row.
 * Favorites and watchlist use the local row for their foreign keys.
 */
export const getOrCreateMovie = async (tmdbId: number) => {
  const existingMovie = await prisma.movie.findUnique({
    where: { tmdbId },
  });

  if (existingMovie) {
    return existingMovie;
  }

  const tmdbMovie = await getMovieDetails(tmdbId);

  try {
    return await prisma.movie.create({
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
  } catch (error) {
    // Another request may have inserted this movie concurrently.
    const movieCreatedByConcurrentRequest = await prisma.movie.findUnique({
      where: { tmdbId },
    });

    if (movieCreatedByConcurrentRequest) {
      return movieCreatedByConcurrentRequest;
    }

    throw error;
  }
};
