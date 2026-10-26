import MovieSection from "../home/MovieSection";

import type { Movie } from "../../types/movie";
import type { TMDBMovie } from "../../services/movie.api";

export default function SimilarMovies({ movies }: { movies: TMDBMovie[] }) {
  const similar: Movie[] = movies
    .filter((movie) => movie.poster_path)
    .slice(0, 12)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date || null,
      rating: movie.vote_average,
      voteCount: movie.vote_count ?? 0,
      popularity: movie.popularity ?? 0,
      originalLanguage: movie.original_language ?? "",
      genreIds: movie.genre_ids ?? [],
      genres: movie.genres ?? [],
    }));

  if (similar.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-2 sm:px-6 lg:px-8">
      <MovieSection title="Similar Movies" movies={similar} />
    </div>
  );
}