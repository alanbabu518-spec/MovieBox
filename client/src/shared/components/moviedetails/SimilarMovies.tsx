import MovieCard from "../movie/MovieCard";
import type { Movie } from "../../types/movie";
import type { TMDBMovie } from "../../services/movie.api";

interface SimilarMoviesProps {
  movies: TMDBMovie[];
}

export default function SimilarMovies({
  movies,
}: SimilarMoviesProps) {
  const similarMovies: Movie[] = movies
    .filter((movie) => movie.poster_path)
    .slice(0, 6)
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

  if (similarMovies.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div className="mb-8">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{
            color: "var(--primary)",
          }}
        >
          MovieBox
        </p>

        <h2
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Similar Movies
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-12 md:grid-cols-4 md:gap-x-8 lg:grid-cols-5 xl:grid-cols-6">
        {similarMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>
    </section>
  );
}