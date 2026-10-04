import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ChevronRight,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import MovieCard from "../movie/MovieCard";

import MovieSectionFilters, {
  type MovieFilters,
  type MovieFilterKey,
} from "../movie/MovieSectionFilters";

import type { Movie } from "../../types/movie";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
  type MovieFilterParams,
} from "../../services/movie.api";

import { useAuth } from "../../../shared/context/AuthContext";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllPath?: string;
  category:
    | "trending"
    | "upcoming"
    | "popular";
}

const INITIAL_VISIBLE_MOVIES = 12;
const MOBILE_INITIAL_VISIBLE_MOVIES = 6;
const LOAD_MORE_COUNT = 8;

const DEFAULT_FILTERS: MovieFilters = {
  genre: "",
  language: "",
  year: "",
  rating: "",
};

function mapMovies(
  movies: Awaited<
    ReturnType<typeof getTrendingMovies>
  >["movies"],
): Movie[] {
  return movies
    .filter((movie) => movie.poster_path)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath:
        movie.backdrop_path,
      releaseDate:
        movie.release_date || null,
      rating: movie.vote_average,
      voteCount: 0,
      popularity: 0,
      originalLanguage: "",
      genreIds: movie.genre_ids ?? [],
      genres: movie.genres ?? [],
    }));
}

function buildFilterParams(
  filters: MovieFilters,
  page: number,
): MovieFilterParams {
  return {
    ...(filters.genre
      ? { genre: filters.genre }
      : {}),
    ...(filters.language
      ? { language: filters.language }
      : {}),
    ...(filters.year
      ? { year: filters.year }
      : {}),
    ...(filters.rating
      ? {
          minRating: filters.rating,
        }
      : {}),
    page,
  };
}

function getFiltersFromUrl(
  searchParams: URLSearchParams,
  category: string,
): MovieFilters {
  if (
    searchParams.get("category") !==
    category
  ) {
    return DEFAULT_FILTERS;
  }

  return {
    genre:
      searchParams.get("genre") ?? "",
    language:
      searchParams.get("language") ?? "",
    year:
      searchParams.get("year") ?? "",
    rating:
      searchParams.get("rating") ?? "",
  };
}

function hasActiveFilters(
  filters: MovieFilters,
) {
  return Boolean(
    filters.genre ||
      filters.language ||
      filters.year ||
      filters.rating,
  );
}

async function fetchCategoryMovies(
  category:
    | "trending"
    | "upcoming"
    | "popular",
  params: MovieFilterParams,
) {
  if (category === "trending") {
    return getTrendingMovies(params);
  }

  if (category === "upcoming") {
    return getUpcomingMovies(params);
  }

  return getPopularMovies(params);
}

function MovieSection({
  title,
  movies,
  viewAllPath,
  category,
}: MovieSectionProps) {
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  const [searchParams] =
    useSearchParams();

  const [isMobile, setIsMobile] =
    useState(() =>
      window.matchMedia(
        "(max-width: 639px)",
      ).matches,
    );

  const initialVisibleCount = isMobile
    ? MOBILE_INITIAL_VISIBLE_MOVIES
    : INITIAL_VISIBLE_MOVIES;

  const [filters, setFilters] =
    useState<MovieFilters>(() =>
      getFiltersFromUrl(
        searchParams,
        category,
      ),
    );

  const [loadedMovies, setLoadedMovies] =
    useState<Movie[]>(movies);

  const [visibleCount, setVisibleCount] =
    useState(
      Math.min(
        initialVisibleCount,
        movies.length,
      ),
    );

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [filterLoading, setFilterLoading] =
    useState(false);

  const [loadMoreLoading, setLoadMoreLoading] =
    useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(max-width: 639px)",
      );

    const handleChange = () => {
      setIsMobile(
        mediaQuery.matches,
      );
    };

    handleChange();

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );
    };
  }, []);

  useEffect(() => {
    setVisibleCount(
      Math.min(
        initialVisibleCount,
        loadedMovies.length,
      ),
    );
  }, [
    initialVisibleCount,
    loadedMovies.length,
  ]);

  useEffect(() => {
    const urlFilters =
      getFiltersFromUrl(
        searchParams,
        category,
      );

    setFilters(urlFilters);

    const currentRequest =
      ++requestId.current;

    const loadInitialMovies =
      async () => {
        if (
          !hasActiveFilters(
            urlFilters,
          )
        ) {
          setLoadedMovies(movies);

          setVisibleCount(
            Math.min(
              initialVisibleCount,
              movies.length,
            ),
          );

          setCurrentPage(1);
          setTotalPages(1);
          setFilterLoading(false);

          return;
        }

        setFilterLoading(true);

        try {
          const result =
            await fetchCategoryMovies(
              category,
              buildFilterParams(
                urlFilters,
                1,
              ),
            );

          if (
            currentRequest !==
            requestId.current
          ) {
            return;
          }

          const normalizedMovies =
            mapMovies(
              result.movies,
            );

          setLoadedMovies(
            normalizedMovies,
          );

          setVisibleCount(
            Math.min(
              initialVisibleCount,
              normalizedMovies.length,
            ),
          );

          setCurrentPage(
            result.page,
          );

          setTotalPages(
            result.totalPages,
          );
        } catch (error) {
          if (
            currentRequest !==
            requestId.current
          ) {
            return;
          }

          console.error(
            `Failed to filter ${category} movies:`,
            error,
          );

          setLoadedMovies([]);
          setVisibleCount(0);
          setCurrentPage(1);
          setTotalPages(1);
        } finally {
          if (
            currentRequest ===
            requestId.current
          ) {
            setFilterLoading(false);
          }
        }
      };

    loadInitialMovies();
  }, [
    searchParams,
    category,
    movies,
    initialVisibleCount,
  ]);

  const handleFilterChange =
    useCallback(
      (
        key: MovieFilterKey,
        value: string,
      ) => {
        const nextParams =
          new URLSearchParams(
            searchParams,
          );

        nextParams.set(
          "category",
          category,
        );

        nextParams.delete("page");

        if (value) {
          nextParams.set(
            key,
            value,
          );
        } else {
          nextParams.delete(key);
        }

        navigate(
          `/movies?${nextParams.toString()}`,
        );
      },
      [
        searchParams,
        navigate,
        category,
      ],
    );

  const handleViewAll = () => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    if (viewAllPath) {
      navigate(viewAllPath);
    }
  };

  const handleViewMore =
    useCallback(async () => {
      if (loadMoreLoading) {
        return;
      }

      if (
        visibleCount <
        loadedMovies.length
      ) {
        setVisibleCount(
          Math.min(
            visibleCount +
              LOAD_MORE_COUNT,
            loadedMovies.length,
          ),
        );

        return;
      }

      const nextPage =
        currentPage + 1;

      if (
        nextPage > totalPages
      ) {
        return;
      }

      setLoadMoreLoading(true);

      try {
        const result =
          await fetchCategoryMovies(
            category,
            buildFilterParams(
              filters,
              nextPage,
            ),
          );

        const nextMovies =
          mapMovies(
            result.movies,
          );

        setLoadedMovies(
          (previousMovies) => [
            ...previousMovies,
            ...nextMovies,
          ],
        );

        setCurrentPage(
          result.page,
        );

        setTotalPages(
          result.totalPages,
        );

        setVisibleCount(
          (previousCount) =>
            Math.min(
              previousCount +
                LOAD_MORE_COUNT,
              loadedMovies.length +
                nextMovies.length,
            ),
        );
      } catch (error) {
        console.error(
          `Failed to load more ${category} movies:`,
          error,
        );
      } finally {
        setLoadMoreLoading(false);
      }
    }, [
      loadMoreLoading,
      visibleCount,
      loadedMovies.length,
      currentPage,
      totalPages,
      category,
      filters,
    ]);

  const visibleMovies =
    loadedMovies.slice(
      0,
      visibleCount,
    );

  const hasMoreLoadedMovies =
    visibleCount <
    loadedMovies.length;

  const hasMoreApiPages =
    currentPage <
    totalPages;

  const showViewMore =
    !filterLoading &&
    (hasMoreLoadedMovies ||
      hasMoreApiPages);

  if (!movies.length) {
    return null;
  }

  return (
    <section className="mb-20">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p
            className="mb-1 text-[10px] font-semibold uppercase tracking-[0.25em]"
            style={{
              color: "var(--primary)",
            }}
          >
            MovieBox
          </p>

          <h2
            className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            {title}
          </h2>
        </div>

        {viewAllPath && (
          <button
            type="button"
            onClick={handleViewAll}
            className="group flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            <span>View all</span>

            <ChevronRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        )}
      </div>

      <MovieSectionFilters
        filters={filters}
        onChange={handleFilterChange}
      />

      <div className="relative">
        {filterLoading && (
          <div
            className="absolute inset-0 z-10 flex items-start justify-center pt-10 backdrop-blur-[2px]"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--background) 55%, transparent)",
            }}
          >
            <div
              className="h-7 w-7 animate-spin rounded-full border-2 border-transparent"
              style={{
                borderTopColor:
                  "var(--primary)",
                borderRightColor:
                  "var(--primary)",
              }}
            />
          </div>
        )}

        <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 sm:gap-x-7 sm:gap-y-14 md:grid-cols-4 md:gap-x-8 lg:grid-cols-5 xl:grid-cols-6">
          {visibleMovies.map(
            (movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                priority={index < 4}
              />
            ),
          )}
        </div>

        {!filterLoading &&
          visibleMovies.length === 0 && (
            <div
              className="mt-7 py-16 text-center"
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              <p className="text-sm">
                No movies found with
                these filters.
              </p>
            </div>
          )}

        {showViewMore && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={handleViewMore}
              disabled={loadMoreLoading}
              className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                borderColor:
                  "var(--border)",
                color:
                  "var(--text-primary)",
                backgroundColor:
                  "var(--surface)",
              }}
            >
              {loadMoreLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  <span>
                    Loading...
                  </span>
                </>
              ) : (
                <span>
                  View More
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(MovieSection);