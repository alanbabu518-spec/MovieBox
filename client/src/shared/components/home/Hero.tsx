import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Heart,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getIndustryTrendingMovies,
  type MovieIndustry,
  type TMDBMovie,
} from "../../services/movie.api";

import { useAuth } from "../../../shared/context/AuthContext";

interface HeroProps {
  movies?: TMDBMovie[];
}

const INDUSTRIES: MovieIndustry[] = [
  "hollywood",
  "bollywood",
  "kollywood",
  "tollywood",
  "mollywood",
  "kdrama",
];

const INDUSTRY_LABELS: Record<MovieIndustry, string> = {
  hollywood: "Hollywood",
  bollywood: "Bollywood",
  kollywood: "Kollywood",
  tollywood: "Tollywood",
  mollywood: "Mollywood",
  kdrama: "K-Drama",
};

const HERO_DURATION = 6000;
const IMG = "https://image.tmdb.org/t/p";

const hasImage = (item: TMDBMovie) =>
  Boolean(item.backdrop_path || item.poster_path);

const pickRandom = (list: TMDBMovie[]) =>
  list[Math.floor(Math.random() * list.length)];

export default function Hero({ movies = [] }: HeroProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [movie, setMovie] = useState<TMDBMovie | null>(
    () => movies.find(hasImage) ?? null,
  );

  const [industryIndex, setIndustryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [watchlist, setWatchlist] = useState<Set<number>>(
    new Set(),
  );
  const [favorites, setFavorites] = useState<Set<number>>(
    new Set(),
  );
  const [backdrops, setBackdrops] = useState<string[]>([]);

  const cache = useRef<Map<MovieIndustry, TMDBMovie[]>>(
    new Map(),
  );

  const currentIndustry = INDUSTRIES[industryIndex];

  useEffect(() => {
    if (!movie) {
      const fallback = movies.find(hasImage);

      if (fallback) {
        setMovie(fallback);
      }
    }
  }, [movies, movie]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        let list = cache.current.get(currentIndustry);

        if (!list) {
          const result =
            await getIndustryTrendingMovies(
              currentIndustry,
            );

          list = result.filter(hasImage);
          cache.current.set(
            currentIndustry,
            list,
          );
        }

        if (
          cancelled ||
          list.length === 0
        ) {
          return;
        }

        setMovie(pickRandom(list));
      } catch {
        if (cancelled) {
          return;
        }

        const fallback =
          movies.filter(hasImage);

        if (fallback.length > 0) {
          setMovie(pickRandom(fallback));
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [currentIndustry]);

  const imageUrl = movie
    ? movie.backdrop_path
      ? `${IMG}/original${movie.backdrop_path}`
      : `${IMG}/original${movie.poster_path}`
    : null;

  useEffect(() => {
    if (!imageUrl) {
      return;
    }

    const preload = new Image();

    preload.src = imageUrl;

    preload.onload = () =>
      setBackdrops((prev) =>
        prev[prev.length - 1] === imageUrl
          ? prev
          : [...prev, imageUrl].slice(-2),
      );
  }, [imageUrl]);

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIndustryIndex(
        (current) =>
          (current + 1) %
          INDUSTRIES.length,
      );
    }, HERO_DURATION);

    return () =>
      window.clearTimeout(timer);
  }, [industryIndex, paused]);

  const requireAuth = (
    callback: () => void,
  ) => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    callback();
  };

  const toggleWatchlist = () => {
    if (!movie) {
      return;
    }

    requireAuth(() => {
      setWatchlist((prev) => {
        const next = new Set(prev);

        if (next.has(movie.id)) {
          next.delete(movie.id);
        } else {
          next.add(movie.id);
        }

        return next;
      });
    });
  };

  const toggleFavorite = () => {
    if (!movie) {
      return;
    }

    requireAuth(() => {
      setFavorites((prev) => {
        const next = new Set(prev);

        if (next.has(movie.id)) {
          next.delete(movie.id);
        } else {
          next.add(movie.id);
        }

        return next;
      });
    });
  };

  const openMovieDetails = () => {
    if (!movie) {
      return;
    }

    requireAuth(() => {
      navigate(`/movie/${movie.id}`);
    });
  };

  if (!movie || !imageUrl) {
    return (
      <section
        className="relative min-h-[82vh] overflow-hidden bg-black"
        aria-busy="true"
      >
        <div className="absolute inset-0 animate-pulse bg-zinc-900" />

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-end px-6 pb-24 pt-32 lg:px-8">
          <div className="w-full max-w-xl space-y-4">
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="h-14 w-4/5 rounded bg-white/10" />
            <div className="h-3 w-full rounded bg-white/10" />
            <div className="h-3 w-2/3 rounded bg-white/10" />
          </div>
        </div>
      </section>
    );
  }

  const releaseYear = movie.release_date
    ? new Date(
        movie.release_date,
      ).getFullYear()
    : null;

  const isWatchlisted =
    watchlist.has(movie.id);

  const isFavorited =
    favorites.has(movie.id);

  return (
    <section
      className="relative min-h-[82vh] overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured movies"
    >
      <style>{`
        @keyframes heroFade {
          from {
            opacity: 0;
            transform: scale(1.04);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes heroRise {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-anim {
            animation: none !important;
          }
        }
      `}</style>

      <div
        className="absolute inset-0"
        aria-hidden="true"
      >
        {backdrops.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="hero-anim absolute inset-0 h-full w-full object-cover object-[center_20%]"
            style={
              i ===
                backdrops.length - 1 &&
              backdrops.length > 1
                ? {
                    animation:
                      "heroFade 1100ms ease-out both",
                  }
                : undefined
            }
          />
        ))}
      </div>

      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background: `
            linear-gradient(
              90deg,
              rgba(0,0,0,0.92) 0%,
              rgba(0,0,0,0.72) 32%,
              rgba(0,0,0,0.25) 70%,
              rgba(0,0,0,0.1) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0) 22%,
              rgba(0,0,0,0) 55%,
              var(--background) 100%
            )
          `,
        }}
      />

      <div className="relative mx-auto flex min-h-[82vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 lg:px-8 lg:pb-24">
        <div>
          <div
            key={movie.id}
            className="hero-anim max-w-2xl"
            style={{
              animation:
                "heroRise 650ms ease-out both",
            }}
            aria-live="polite"
          >
            <div className="mb-5 flex items-center gap-3">
              <span
                className="h-px w-10"
                style={{
                  backgroundColor:
                    "var(--primary)",
                }}
              />

              <span
                className="text-sm font-medium"
                style={{
                  color:
                    "var(--primary)",
                }}
              >
                Trending in{" "}
                {
                  INDUSTRY_LABELS[
                    currentIndustry
                  ]
                }
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
              {movie.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-sm text-white/80">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                <Star
                  size={14}
                  fill="currentColor"
                  style={{
                    color:
                      "var(--primary)",
                  }}
                />

                <span className="font-semibold text-white">
                  {movie.vote_average.toFixed(
                    1,
                  )}
                </span>
              </span>

              {releaseYear && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                  <CalendarDays
                    size={14}
                  />
                  {releaseYear}
                </span>
              )}

              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 backdrop-blur-md">
                Movie
              </span>
            </div>

            {movie.overview && (
              <p className="mt-6 line-clamp-3 max-w-xl text-[15px] leading-7 text-white/70 sm:text-base sm:leading-8">
                {movie.overview}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  openMovieDetails
                }
                className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{
                  backgroundColor:
                    "var(--primary)",
                  boxShadow:
                    "0 10px 30px -10px var(--primary)",
                }}
              >
                <Play
                  size={16}
                  fill="currentColor"
                />
                Watch details
              </button>

              <button
                type="button"
                onClick={
                  toggleWatchlist
                }
                aria-pressed={
                  isWatchlisted
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {isWatchlisted ? (
                  <Check size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {isWatchlisted
                  ? "In watchlist"
                  : "Add to watchlist"}
              </button>

              <button
                type="button"
                onClick={
                  toggleFavorite
                }
                aria-pressed={
                  isFavorited
                }
                aria-label={
                  isFavorited
                    ? `Remove ${movie.title} from favorites`
                    : `Add ${movie.title} to favorites`
                }
                className={`inline-flex h-11.5 w-11.5 items-center justify-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isFavorited
                    ? "text-red-500"
                    : "text-white"
                }`}
              >
                <Heart
                  size={19}
                  fill={
                    isFavorited
                      ? "currentColor"
                      : "none"
                  }
                  strokeWidth={
                    isFavorited
                      ? 2.2
                      : 1.8
                  }
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}