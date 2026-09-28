import { prisma } from "../../config/database";
import { addMovieTitles } from "./autocomplete.service.js";
import { discoverMovies } from "../../integrations/tmdb/tmdb.service";

export const ingestMovieCatalog = async (
  pages = 5,
) => {
  let totalMovies = 0;

  for (let page = 1; page <= pages; page += 1) {
    const result = await discoverMovies(page);

    for (const movie of result.movies) {
      await prisma.movie.upsert({
        where: {
          tmdbId: movie.id,
        },
        update: {
          title: movie.title,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseDate: movie.releaseDate
            ? new Date(movie.releaseDate)
            : null,
        },
        create: {
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.posterPath,
          backdropPath: movie.backdropPath,
          releaseDate: movie.releaseDate
            ? new Date(movie.releaseDate)
            : null,
        },
      });

      addMovieTitles([movie.title]);

      totalMovies += 1;
    }
  }

  return {
    pages,
    totalMovies,
  };
};