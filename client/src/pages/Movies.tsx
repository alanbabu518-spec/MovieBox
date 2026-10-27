import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  LayoutGrid,
  List,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import Navbar from "../shared/components/layout/Navbar";
import MovieCard from "../shared/components/movie/MovieCard";
import MovieRow from "../shared/components/movie/MovieRow";
import Sheet from "../shared/components/ui/Sheet";
import DiscoverFilters, {
  type DiscoverValues,
} from "../shared/components/movie/DiscoverFilters";

import { GENRES } from "../shared/constants/genres";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  searchMovies,
  type MovieFilterParams,
} from "../shared/services/movie.api";

import type { Movie } from "../shared/types/movie";
import { cn } from "../shared/lib/cn";

const mapMovies = (
  movies: Awaited<ReturnType<typeof searchMovies>>["movies"],
): Movie[] =>
  movies
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

/**
 * Converts API/network failures into messages that are useful to users.
 * Keep technical details in the console, not in the UI.
 */
function getMovieErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as {
    code?: string;
    message?: string;
    response?: { status?: number };
  };

  const status = apiError?.response?.status;

  if (
    apiError?.code === "ECONNABORTED" ||
    apiError?.code === "ETIMEDOUT" ||
    status === 408
  ) {
    return "The request took too long. Please try again.";
  }

  if (!apiError?.response) {
    return "Unable to connect. Check your internet connection and try again.";
  }

  if (status === 401) {
    return "Your session may have expired. Please refresh the page and try again.";
  }

  if (status === 403) {
    return "This request is not allowed. Please try again later.";
  }

  if (status === 404) {
    return "We couldn't find the requested movies. Try another search.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status && status >= 500) {
    return "Our movie service is temporarily unavailable. Please try again shortly.";
  }

  return fallback;
}

type MovieCategory = "trending" | "upcoming" | "popular";

function isMovieCategory(value: string | null): value is MovieCategory {
  return value === "trending" || value === "upcoming" || value === "popular";
}

const POPULAR_SEARCHES = [
  "Dune",
  "Batman",
  "Oppenheimer",
  "Marvel",
  "Inception",
  "Interstellar",
];

const GRID =
  "grid grid-cols-3 gap-x-2.5 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5";

export default function Movies() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [retryVersion, setRetryVersion] = useState(0);
  const [retryPage, setRetryPage] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [trendingBackdrops, setTrendingBackdrops] = useState<string[]>([]);
  const [activeBackdrop, setActiveBackdrop] = useState(0);

  /* Load trending movie backdrops for the rotating Discover hero. */
  useEffect(() => {
    let cancelled = false;
    const loadBackdrops = async () => {
      try {
        const result = await getTrendingMovies({ page: 1 });
        const images = result.movies
          .filter((movie) => movie.backdrop_path)
          .slice(0, 8)
          .map(
            (movie) => `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`,
          );
        if (!cancelled) setTrendingBackdrops(images);
      } catch (err) {
        console.error("Failed to load trending movie backdrops:", err);
      }
    };
    void loadBackdrops();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (trendingBackdrops.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveBackdrop((current) => (current + 1) % trendingBackdrops.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [trendingBackdrops]);

  /* A search started from the navbar arrives as ?q= */
  const urlQuery = searchParams.get("q");

  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);

  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);

    if (urlQuery) {
      setQuery(urlQuery);
    }
  }

  const categoryParam = searchParams.get("category");
  const category: MovieCategory = isMovieCategory(categoryParam)
    ? categoryParam
    : "popular";

  const genre = searchParams.get("genre") ?? "";
  const language = searchParams.get("language") ?? "";
  const year = searchParams.get("year") ?? "";
  const minRating = searchParams.get("rating") ?? "";

  const hasActiveFilters = Boolean(genre || language || year || minRating);

  const values: DiscoverValues = {
    category,
    genre,
    language,
    year,
    rating: minRating,
  };

  const updateUrl = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.set("category", category);
    nextParams.delete("page");

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    // choosing a filter leaves search mode
    setQuery("");
    nextParams.delete("q");

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
      return getTrendingMovies({ ...params, page: nextPage });
    }

    if (category === "upcoming") {
      return getUpcomingMovies({ ...params, page: nextPage });
    }

    return getPopularMovies({ ...params, page: nextPage });
  };

  /* Category + filters */
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
      } catch (err) {
        console.error("Movie category loading failed:", err);
        setError(getMovieErrorMessage(err, "Unable to load movies right now."));
        setRetryPage(null);
      } finally {
        setLoading(false);
      }
    };

    void loadMovies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    category,
    genre,
    language,
    year,
    minRating,
    query,
    searchParams,
    retryVersion,
  ]);

  /* Debounced search */
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        setHasSearched(true);

        const result = await searchMovies(trimmed, 1);

        setMovies(mapMovies(result.movies));
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalResults(result.totalResults);
      } catch (err) {
        console.error("Movie search failed:", err);
        setError(
          getMovieErrorMessage(err, "Unable to search movies right now."),
        );
        setRetryPage(null);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [query, retryVersion]);

  const handlePageChange = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || loading) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRetryPage(null);

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
        setSearchParams(nextParams, { replace: true });
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Failed to change page:", err);
      setError(getMovieErrorMessage(err, "Unable to load this page."));
      setRetryPage(nextPage);
    } finally {
      setLoading(false);
    }
  };

  const searching = Boolean(query.trim());

  const title = searching
    ? "Search results"
    : category === "trending"
      ? "Trending Movies"
      : category === "upcoming"
        ? "Upcoming Movies"
        : "Popular Movies";

  const activeCount = [genre, language, year, minRating].filter(Boolean).length;

  const filters = (
    <DiscoverFilters
      values={values}
      onChange={(key, value) => updateUrl(key, value)}
      onReset={handleResetFilters}
      hasActive={hasActiveFilters}
    />
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Discover hero with rotating trending-movie backdrops */}
        <section className="relative isolate overflow-hidden border-b border-line">
          <div aria-hidden="true" className="absolute inset-0 -z-20 bg-surface">
            {trendingBackdrops.map((backdrop, index) => (
              <div
                key={backdrop}
                className={cn(
                  "absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none",
                  index === activeBackdrop ? "opacity-100" : "opacity-0",
                )}
                style={{ backgroundImage: `url("${backdrop}")` }}
              />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,10,15,0.94)_0%,rgba(8,10,15,0.78)_48%,rgba(8,10,15,0.48)_100%),linear-gradient(0deg,rgba(8,10,15,0.88)_0%,rgba(8,10,15,0.18)_70%),radial-gradient(40rem_18rem_at_85%_0%,var(--glow),transparent_70%)]"
          />
          <div className="mx-auto max-w-[1400px] px-4 pb-7 pt-7 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8">
            <Link
              to="/"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink md:hidden"
            >
              <ArrowLeft size={16} />
              Home
            </Link>

            <h1 className="max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-5xl lg:text-6xl">
              Discover <span className="text-white/75">Incredible Stories</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              Search thousands of movies and find exactly what you feel like
              watching.
            </p>

            <div className="mt-5 flex max-w-3xl items-center gap-2 rounded-2xl border border-white/20 bg-black/40 p-1.5 pl-4 shadow-xl shadow-black/10 backdrop-blur-md focus-within:border-brand/70">
              <Search size={18} className="shrink-0 text-white/70" />

              <input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search movies…"
                aria-label="Search movies"
                className="h-10 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/60"
              />

              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted active:scale-90"
                >
                  <X size={17} />
                </button>
              )}

              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white sm:w-12">
                <Search size={18} />
              </span>
            </div>

            <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <span className="shrink-0 self-center text-xs font-medium text-white/70">
                Popular searches
              </span>

              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="shrink-0 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition-[transform,background-color,color] duration-150 hover:bg-white/15 hover:text-white active:scale-95"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-10 pt-6 sm:px-6 lg:grid-cols-[272px_minmax(0,1fr)] lg:px-8">
          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <div className="scrollbar-none sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-5">
              {filters}
            </div>
          </aside>

          <section aria-live="polite" className="min-w-0">
            {/* Mobile: genre chips */}
            <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:hidden">
              {[{ id: "", name: "All" }, ...GENRES].map((item) => (
                <button
                  key={item.id || "all"}
                  type="button"
                  aria-pressed={genre === item.id}
                  onClick={() => updateUrl("genre", item.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-[transform,background-color] duration-150 active:scale-95",
                    genre === item.id
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white/5 text-muted",
                  )}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-bold sm:text-2xl">
                  {title}
                </h2>

                {!loading && totalResults > 0 && (
                  <p className="mt-0.5 text-sm text-muted">
                    {totalResults.toLocaleString()}{" "}
                    {searching ? `results for “${query.trim()}”` : "movies"}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  className="relative flex h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-sm font-medium active:scale-95 lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeCount > 0 && (
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                      {activeCount}
                    </span>
                  )}
                </button>

                <div
                  role="group"
                  aria-label="View"
                  className="flex rounded-xl border border-line bg-surface p-1"
                >
                  {(
                    [
                      ["grid", LayoutGrid, "Grid view"],
                      ["list", List, "List view"],
                    ] as const
                  ).map(([mode, Icon, label]) => (
                    <button
                      key={mode}
                      type="button"
                      aria-label={label}
                      aria-pressed={view === mode}
                      onClick={() => setView(mode)}
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg transition-colors duration-150",
                        view === mode
                          ? "bg-brand text-white"
                          : "text-muted hover:text-ink",
                      )}
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex flex-col items-center rounded-2xl border border-line bg-card px-6 py-12 text-center"
              >
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-500">
                  <AlertTriangle size={26} />
                </div>

                <h3 className="font-display text-lg font-bold text-ink">
                  Something went wrong
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-muted">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    if (retryPage !== null) {
                      void handlePageChange(retryPage);
                    } else {
                      setRetryVersion((version) => version + 1);
                    }
                  }}
                  disabled={loading}
                  className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  {loading ? "Trying again..." : "Try again"}
                </button>
              </div>
            ) : loading || !hasSearched ? (
              <div className={GRID}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index}>
                    <div className="skeleton aspect-2/3 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : movies.length > 0 ? (
              <>
                {view === "grid" ? (
                  <ul role="list" className={GRID}>
                    {movies.map((movie, index) => (
                      <li key={movie.id} className="min-w-0">
                        <MovieCard movie={movie} priority={index < 6} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul role="list" className="grid gap-3 xl:grid-cols-2">
                    {movies.map((movie) => (
                      <MovieRow key={movie.id} movie={movie} />
                    ))}
                  </ul>
                )}

                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination"
                    className="mt-10 flex items-center justify-center gap-3"
                  >
                    <button
                      type="button"
                      disabled={page === 1 || loading}
                      onClick={() => void handlePageChange(page - 1)}
                      className="h-10 rounded-xl border border-line bg-surface px-5 text-sm font-medium transition-transform active:scale-95 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="px-2 text-sm text-muted">
                      {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page === totalPages || loading}
                      onClick={() => void handlePageChange(page + 1)}
                      className="h-10 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-transform active:scale-95 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-line bg-card p-12 text-center text-sm text-muted">
                {searching
                  ? `No movies found for “${query.trim()}”.`
                  : "No movies match these filters."}
              </div>
            )}
          </section>
        </div>
      </main>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Filters"
        footer={
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="h-12 w-full rounded-xl bg-brand text-base font-semibold text-white active:scale-[0.98]"
          >
            Show {totalResults ? totalResults.toLocaleString() : ""} results
          </button>
        }
      >
        {filters}
      </Sheet>
    </div>
  );
}
