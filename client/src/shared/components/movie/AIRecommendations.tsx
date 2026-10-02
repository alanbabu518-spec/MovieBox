import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getAIRecommendations,
  type AIRecommendation,
} from "../../services/ai.api";

const imageBaseUrl =
  "https://image.tmdb.org/t/p/w500";

export default function AIRecommendations() {
  const navigate = useNavigate();

  const [movies, setMovies] =
    useState<AIRecommendation[]>([]);
  const [personalized, setPersonalized] =
    useState(false);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const result =
          await getAIRecommendations();

        setMovies(result.recommendations);
        setPersonalized(result.personalized);
      } catch (error) {
        console.error(
          "Failed to load AI recommendations:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="h-6 w-56 animate-pulse rounded bg-(--card)" />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="aspect-2/3 animate-pulse rounded-xl bg-(--card)"
              />
            ),
          )}
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="flex items-center gap-2">
        <Sparkles
          size={20}
          style={{
            color: "var(--primary)",
          }}
        />

        <div>
          <h2
            className="text-xl font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            AI Recommended for You
          </h2>

          <p
            className="mt-1 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            {personalized
              ? "Based on your Watchlist and Favorites"
              : "Popular movies picked for discovery"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <button
            key={movie.tmdbId}
            type="button"
            onClick={() =>
              navigate(
                `/movies/${movie.tmdbId}`,
              )
            }
            className="group text-left"
          >
            <div className="aspect-2/3 overflow-hidden rounded-xl bg-(--card)">
              {movie.posterPath ? (
                <img
                  src={`${imageBaseUrl}${movie.posterPath}`}
                  alt={movie.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  No Poster
                </div>
              )}
            </div>

            <h3
              className="mt-3 line-clamp-1 text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {movie.title}
            </h3>

            {movie.releaseDate && (
              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                {movie.releaseDate.slice(0, 4)}
              </p>
            )}

            <p
              className="mt-2 line-clamp-2 text-xs leading-5"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {movie.reason}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}