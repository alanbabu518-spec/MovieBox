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
      posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      backdropUrl: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : undefined,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      overview: movie.overview,
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

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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