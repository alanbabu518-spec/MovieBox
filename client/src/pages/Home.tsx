import { useEffect, useState } from "react";

import Hero from "../shared/components/home/Hero";
import MovieSection from "../shared/components/home/MovieSection";
import Navbar from "../shared/components/layout/Navbar";
import ProfileSetupModal from "../shared/components/auth/ProfileSetupModal";

import type { Movie } from "../shared/types/movie";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../shared/services/movie.api";

const mapMovies = (
  movies: Awaited<
    ReturnType<typeof getTrendingMovies>
  >["movies"],
): Movie[] => {
  return movies
    .filter((movie) => movie.poster_path)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      posterUrl: `https://image.tmdb.org/t/p/w342${movie.poster_path}`,
      backdropUrl: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
        : undefined,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
      overview: movie.overview,
    }));
};

function withTimeout<T>(
  promise: Promise<T>,
  timeout = 10000,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => {
        reject(
          new Error(
            "Request timed out",
          ),
        );
      }, timeout);
    }),
  ]);
}

export default function Home() {
  const [trendingMovies, setTrendingMovies] =
    useState<Movie[]>([]);

  const [upcomingMovies, setUpcomingMovies] =
    useState<Movie[]>([]);

  const [popularMovies, setPopularMovies] =
    useState<Movie[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      setLoading(true);
      setError("");

      const results =
        await Promise.allSettled([
          withTimeout(
            getTrendingMovies(),
          ),
          withTimeout(
            getUpcomingMovies(),
          ),
          withTimeout(
            getPopularMovies(),
          ),
        ]);

      if (cancelled) {
        return;
      }

      const [
        trendingResult,
        upcomingResult,
        popularResult,
      ] = results;

      let hasError = false;

      if (
        trendingResult.status ===
        "fulfilled"
      ) {
        setTrendingMovies(
          mapMovies(
            trendingResult.value.movies,
          ),
        );
      } else {
        console.error(
          "Failed to load trending movies:",
          trendingResult.reason,
        );

        hasError = true;
      }

      if (
        upcomingResult.status ===
        "fulfilled"
      ) {
        setUpcomingMovies(
          mapMovies(
            upcomingResult.value.movies,
          ),
        );
      } else {
        console.error(
          "Failed to load upcoming movies:",
          upcomingResult.reason,
        );

        hasError = true;
      }

      if (
        popularResult.status ===
        "fulfilled"
      ) {
        setPopularMovies(
          mapMovies(
            popularResult.value.movies,
          ),
        );
      } else {
        console.error(
          "Failed to load popular movies:",
          popularResult.reason,
        );

        hasError = true;
      }

      if (hasError) {
        setError(
          "Some movie sections could not be loaded.",
        );
      }

      setLoading(false);
    };

    loadMovies();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor:
          "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <main>
        <Hero />

        <section className="mx-auto max-w-310 px-6 pb-28 pt-8 lg:px-8">
          {loading ? (
            <MovieLoadingSections />
          ) : (
            <>
              {error && (
                <div
                  className="mb-10 rounded-xl border p-5"
                  style={{
                    backgroundColor:
                      "var(--card)",
                    borderColor:
                      "var(--border)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      color:
                        "var(--text-secondary)",
                    }}
                  >
                    {error}
                  </p>
                </div>
              )}

              {trendingMovies.length > 0 && (
                <MovieSection
                  title="Trending Movies"
                  movies={trendingMovies}
                  viewAllPath="/movies?category=trending"
                  category="trending"
                />
              )}

              {upcomingMovies.length > 0 && (
                <MovieSection
                  title="Upcoming Movies"
                  movies={upcomingMovies}
                  viewAllPath="/movies?category=upcoming"
                  category="upcoming"
                />
              )}

              {popularMovies.length > 0 && (
                <MovieSection
                  title="Popular Movies"
                  movies={popularMovies}
                  viewAllPath="/movies?category=popular"
                  category="popular"
                />
              )}
            </>
          )}
        </section>
      </main>

      <ProfileSetupModal />
    </div>
  );
}

function MovieLoadingSections() {
  return (
    <>
      <LoadingSection title="Trending Movies" />
      <LoadingSection title="Upcoming Movies" />
      <LoadingSection title="Popular Movies" />
    </>
  );
}

function LoadingSection({
  title,
}: {
  title: string;
}) {
  return (
    <section className="mb-20">
      <div className="mb-6">
        <div
          className="mb-2 h-3 w-20 animate-pulse rounded"
          style={{
            backgroundColor:
              "var(--card)",
          }}
        />

        <div
          className="h-8 w-48 animate-pulse rounded"
          style={{
            backgroundColor:
              "var(--card)",
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 md:gap-x-6 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={`${title}-${index}`}
          >
            <div
              className="aspect-2/3 animate-pulse rounded"
              style={{
                backgroundColor:
                  "var(--card)",
              }}
            />

            <div
              className="mt-3 h-4 w-3/4 animate-pulse rounded"
              style={{
                backgroundColor:
                  "var(--card)",
              }}
            />

            <div
              className="mt-2 h-3 w-1/2 animate-pulse rounded"
              style={{
                backgroundColor:
                  "var(--card)",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}