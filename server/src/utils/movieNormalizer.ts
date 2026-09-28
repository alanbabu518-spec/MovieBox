import { Movie } from "../types/movie.js";
import { TMDBMovie } from "../types/tmdb.js";

export const normalizeTMDBMovie = (
  movie: TMDBMovie,
): Movie => {
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
  };
};