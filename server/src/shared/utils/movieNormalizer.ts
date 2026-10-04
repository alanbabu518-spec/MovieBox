import { Movie } from "../types/movie.js";
import { TMDBMovie } from "../types/tmdb.js";

export const normalizeTMDBMovie = (
  movie: TMDBMovie,
  genreMap: Map<number, string> = new Map(),
): Movie => {
  const genreIds = movie.genre_ids ?? [];

  const genres = genreIds
    .map((genreId) => genreMap.get(genreId))
    .filter(
      (genre): genre is string =>
        Boolean(genre),
    );

  return {
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    releaseDate: movie.release_date || null,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    originalLanguage: movie.original_language,
    genreIds,
    genres,
  };
};