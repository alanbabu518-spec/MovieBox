import { useEffect, useState } from "react";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import MovieCard from "../shared/components/movie/MovieCard";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies,
  type MovieFilterParams,
} from "../shared/services/movie.api";

import type { Movie } from "../shared/types/movie";

const mapMovies = (
  movies: Awaited<ReturnType<typeof searchMovies>>["movies"],
): Movie[] => {
  return movies
    .filter((movie) => movie.poster_path)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path ?? null,
      releaseDate: movie.release_date || null,
      rating: movie.vote_average,
      voteCount: movie.vote_count ?? 0,
      popularity: movie.popularity ?? 0,
      originalLanguage: movie.original_language ?? "",
      genreIds: movie.genre_ids ?? [],
      genres: movie.genres ?? [],
    }));
};

const genres = [
  { id: "28", name: "Action" },
  { id: "12", name: "Adventure" },
  { id: "16", name: "Animation" },
  { id: "35", name: "Comedy" },
  { id: "80", name: "Crime" },
  { id: "99", name: "Documentary" },
  { id: "18", name: "Drama" },
  { id: "10751", name: "Family" },
  { id: "14", name: "Fantasy" },
  { id: "36", name: "History" },
  { id: "27", name: "Horror" },
  { id: "10402", name: "Music" },
  { id: "9648", name: "Mystery" },
  { id: "10749", name: "Romance" },
  { id: "878", name: "Science Fiction" },
  { id: "53", name: "Thriller" },
  { id: "10752", name: "War" },
  { id: "37", name: "Western" },
];

const languages = [
  { id: "en", name: "English" },
  { id: "hi", name: "Hindi" },
  { id: "ta", name: "Tamil" },
  { id: "te", name: "Telugu" },
  { id: "ml", name: "Malayalam" },
  { id: "kn", name: "Kannada" },
  { id: "ko", name: "Korean" },
  { id: "ja", name: "Japanese" },
  { id: "es", name: "Spanish" },
  { id: "fr", name: "French" },
  { id: "de", name: "German" },
  { id: "zh", name: "Chinese" },
];

const currentYear = new Date().getFullYear();

const years = Array.from(
  { length: 30 },
  (_, index) => currentYear - index,
);

type MovieCategory = "trending" | "upcoming" | "popular";

function isMovieCategory(value: string | null): value is MovieCategory {
  return value === "trending" || value === "upcoming" || value === "popular";
}

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categoryParam = searchParams.get("category");

  const category: MovieCategory = isMovieCategory(categoryParam)
    ? categoryParam
    : "popular";

  const genre = searchParams.get("genre") ?? "";
  const language = searchParams.get("language") ?? "";
  const year = searchParams.get("year") ?? "";
  const minRating = searchParams.get("rating") ?? "";

  const hasActiveFilters = Boolean(
    genre || language || year || minRating,
  );

  const updateUrl = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("category", category);
    nextParams.delete("page");

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    const nextParams = new URLSearchParams();

    nextParams.set("category", category);

    setSearchParams(nextParams);
    setPage(1);
  };

  const loadCategoryMovies = async (
    params: MovieFilterParams,
    nextPage = 1,
  ) => {
    if (category === "trending") {
      return getTrendingMovies({
        ...params,
        page: nextPage,
      });
    }

    if (category === "upcoming") {
      return getUpcomingMovies({
        ...params,
        page: nextPage,
      });
    }

    return getPopularMovies({
      ...params,
      page: nextPage,
    });
  };

  useEffect(() => {
    if (query.trim()) {
      return;
    }

    const loadMovies = async () => {
      try {
        setLoading(true);
        setError("");
        setHasSearched(true);

        const requestedPage = Number(searchParams.get("page")) || 1;

        const result = await loadCategoryMovies(
          {
            genre: genre || undefined,
            language: language || undefined,
            year: year || undefined,
            minRating: minRating || undefined,
          },
          requestedPage,
        );

        setMovies(mapMovies(result.movies));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);
      } catch (error) {
        console.error("Movie category loading failed:", error);

        setError("Unable to load movies right now.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [
    category,
    genre,
    language,
    year,
    minRating,
    query,
    searchParams,
  ]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        setHasSearched(true);

        const result = await searchMovies(trimmedQuery, 1);

        setMovies(mapMovies(result.movies));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);
      } catch (error) {
        console.error("Movie search failed:", error);

        setError("Unable to search movies right now.");
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (query.trim()) {
        const result = await searchMovies(query.trim(), nextPage);

        setMovies(mapMovies(result.movies));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);
      } else {
        const result = await loadCategoryMovies(
          {
            genre: genre || undefined,
            language: language || undefined,
            year: year || undefined,
            minRating: minRating || undefined,
          },
          nextPage,
        );

        setMovies(mapMovies(result.movies));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);

        const nextParams = new URLSearchParams(searchParams);

        nextParams.set("page", String(result.page));

        setSearchParams(nextParams, {
          replace: true,
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to change page:", error);

      setError("Unable to load this page.");
    } finally {
      setLoading(false);
    }
  };

  const categoryTitle =
    category === "trending"
      ? "Trending Movies"
      : category === "upcoming"
        ? "Upcoming Movies"
        : "Popular Movies";

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pb-24 pt-6 sm:pt-8 lg:px-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="max-w-3xl">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
            style={{
              color: "var(--primary)",
            }}
          >
            MovieBox
          </p>

          <h1
            className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Discover Movies
          </h1>

          <p
            className="mt-4 max-w-2xl text-sm leading-7 sm:text-base"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Search thousands of movies and discover your next favorite.
          </p>
        </div>

        <div className="mt-10 flex gap-3">
          <div
            className="flex h-12 flex-1 items-center gap-3 rounded-lg border px-4"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <Search
              size={19}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search movies..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="flex h-12 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors"
            style={{
              backgroundColor: showFilters
                ? "var(--primary)"
                : "var(--surface)",
              borderColor: showFilters
                ? "var(--primary)"
                : "var(--border)",
              color: showFilters
                ? "#ffffff"
                : "var(--text-primary)",
            }}
          >
            <SlidersHorizontal size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        {showFilters && (
          <div
            className="mt-4 rounded-xl border p-5 sm:p-6"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Genre
                </label>

                <select
                  value={genre}
                  onChange={(event) =>
                    updateUrl("genre", event.target.value)
                  }
                  className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="">All Genres</option>

                  {genres.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Language
                </label>

                <select
                  value={language}
                  onChange={(event) =>
                    updateUrl("language", event.target.value)
                  }
                  className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="">All Languages</option>

                  {languages.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Release Year
                </label>

                <select
                  value={year}
                  onChange={(event) =>
                    updateUrl("year", event.target.value)
                  }
                  className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="">All Years</option>

                  {years.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Minimum Rating
                </label>

                <select
                  value={minRating}
                  onChange={(event) =>
                    updateUrl("rating", event.target.value)
                  }
                  className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <option value="">Any Rating</option>
                  <option value="9">9+</option>
                  <option value="8">8+</option>
                  <option value="7">7+</option>
                  <option value="6">6+</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-10 rounded-lg border px-5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {hasSearched && (
          <div className="mt-10">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2
                  className="font-display text-2xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  {query.trim() ? "Search Results" : categoryTitle}
                </h2>

                {!loading && totalResults > 0 && (
                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {totalResults.toLocaleString()}{" "}
                    {query.trim()
                      ? `results for "${query}"`
                      : "movies found"}
                  </p>
                )}
              </div>

              {hasActiveFilters && !query.trim() && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-medium"
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>

            {error ? (
              <div
                className="rounded-xl border p-10 text-center"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {error}
                </p>
              </div>
            ) : loading ? (
              <MovieSearchSkeleton />
            ) : movies.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 md:grid-cols-4 md:gap-x-5 md:gap-y-10 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-6 xl:gap-x-6">
                  {movies.map((movie) => (
                    <div key={movie.id} className="min-w-0">
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={page === 1 || loading}
                      onClick={() => handlePageChange(page - 1)}
                      className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Previous
                    </button>

                    <span
                      className="px-3 text-sm"
                      style={{
                        color: "var(--text-secondary)",
                      }}
                    >
                      {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page === totalPages || loading}
                      onClick={() => handlePageChange(page + 1)}
                      className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-xl border p-12 text-center"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {query.trim()
                    ? `No movies found for "${query}".`
                    : "No movies found with these filters."}
                </p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div
            className="mt-16 border-t pt-12"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <p
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Start typing to search for movies or use filters to discover
              movies.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function MovieSearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-9 md:grid-cols-4 md:gap-x-5 md:gap-y-10 lg:grid-cols-5 lg:gap-x-5 lg:gap-y-10 xl:grid-cols-6 xl:gap-x-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="min-w-0">
          <div
            className="aspect-2/3 animate-pulse rounded-lg"
            style={{
              backgroundColor: "var(--card)",
            }}
          />

          <div
            className="mt-2 h-4 w-3/4 animate-pulse rounded"
            style={{
              backgroundColor: "var(--card)",
            }}
          />

          <div
            className="mt-1.5 h-3 w-1/2 animate-pulse rounded"
            style={{
              backgroundColor: "var(--card)",
            }}
          />
        </div>
      ))}
    </div>
  );
}