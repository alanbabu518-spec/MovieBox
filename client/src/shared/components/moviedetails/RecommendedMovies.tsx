import { useEffect, useState } from "react";
import MovieCard from "../movie/MovieCard";
import {
  getRecommendations,
  type RecommendationMovie,
} from "../../services/movie.api";
import type { Movie } from "../../types/movie";

export default function RecommendedMovies() {
  const [movies, setMovies] = useState<
    RecommendationMovie[]
  >([]);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const data = await getRecommendations();
        setMovies(data);
      } catch (error) {
        console.error(
          "Failed to load recommendations:",
          error,
        );
      }
    };

    loadRecommendations();
  }, []);

  const recommendedMovies: Movie[] = movies
    .filter((movie) => movie.posterPath)
    .slice(0, 6)
    .map((movie) => ({
      id: movie.tmdbId,
      title: movie.title,
      posterUrl: `https://image.tmdb.org/t/p/w500${movie.posterPath}`,
      backdropUrl: movie.backdropPath
        ? `https://image.tmdb.org/t/p/w1280${movie.backdropPath}`
        : undefined,
    }));

  if (recommendedMovies.length === 0) {
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
          Recommended for You
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 sm:gap-x-7 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {recommendedMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}
      </div>
    </section>
  );
}