import { useState } from "react";
import { cn } from "../../lib/cn";
import {
  ArrowLeft,
  Play,
  Share2,
  Star,
  CalendarDays,
  Clock3,
  Clapperboard,
} from "lucide-react";

import WatchlistButton from "../movie/WatchlistButton";
import FavoriteButton from "../movie/FavoriteButton";

import type { MovieDetails } from "../../services/movie.api";
import { formatRuntime } from "../../lib/Format";

interface MovieDetailsHeroProps {
  movie: MovieDetails;
  director?: { name: string };
  trailer?: { key: string };
  onBack: () => void;
}

const ghost =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white backdrop-blur-md transition-[transform,background-color] duration-150 hover:bg-white/20 active:scale-95";

const desktopGhost =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 text-sm font-semibold text-white backdrop-blur-md transition duration-200 hover:border-white/25 hover:bg-white/[0.13] active:scale-[0.98]";

export default function MovieDetailsHero({
  movie,
  director,
  trailer,
  onBack,
}: MovieDetailsHeroProps) {
  const [expanded, setExpanded] = useState(false);
  const [shared, setShared] = useState(false);

  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  const runtime = formatRuntime(movie.runtime);
  const longOverview = (movie.overview?.length ?? 0) > 220;

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: movie.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      }
    } catch {
      /* Share dismissed or failed. */
    }
  };

  const meta = [
    year,
    runtime,
    movie.genres
      .slice(0, 3)
      .map((genre) => genre.name)
      .join(", "),
  ].filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background: original mobile styling, enhanced on desktop. */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[78svh] min-h-[520px] md:h-[88svh] md:max-h-[860px] lg:h-[760px] lg:max-h-none">
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt=""
            fetchPriority="high"
            className="animate-fade h-full w-full object-cover object-top lg:object-[center_28%]"
          />
        ) : (
          <div className="h-full w-full bg-card" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_6%,transparent_62%),linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.25)_55%,transparent_100%),linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_28%)] lg:bg-[linear-gradient(to_top,var(--background)_4%,rgba(8,10,16,0.88)_24%,rgba(8,10,16,0.25)_70%,rgba(8,10,16,0.45)_100%),linear-gradient(to_right,rgba(8,10,16,0.92)_0%,rgba(8,10,16,0.76)_36%,rgba(8,10,16,0.30)_72%,rgba(8,10,16,0.18)_100%)]" />

        <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_72%_30%,rgba(255,255,255,0.08),transparent_42%)] lg:block" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 lg:px-8 lg:pb-12 lg:pt-28 xl:pt-32">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-black/35 py-1.5 pl-2.5 pr-4 text-sm font-medium text-white backdrop-blur-md transition-transform active:scale-95 lg:border lg:border-white/15 lg:py-2 lg:pl-3 lg:font-semibold lg:backdrop-blur-xl lg:transition lg:hover:bg-black/50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Poster and movie details. */}
        <div className="mt-16 grid grid-cols-[112px_1fr] items-end gap-4 sm:mt-24 sm:grid-cols-[170px_1fr] sm:gap-8 lg:mt-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center lg:gap-12 xl:grid-cols-[310px_minmax(0,1fr)] xl:gap-14">
          <div className="relative">
            <div className="absolute -inset-3 -z-10 hidden rounded-[28px] bg-black/25 blur-2xl lg:block" />

            <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-white/15 lg:rounded-[22px] lg:border lg:border-white/15 lg:shadow-black/40 lg:ring-black/20">
              {movie.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={`${movie.title} poster`}
                  className="aspect-2/3 w-full object-cover"
                />
              ) : (
                <div className="grid aspect-2/3 w-full place-items-center p-3 text-center text-xs text-white/50">
                  {movie.title}
                </div>
              )}
            </div>

            {trailer && (
              <a
                href="#trailer"
                className="mt-3 hidden h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-black/35 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10 lg:flex"
              >
                <Play size={15} fill="currentColor" strokeWidth={0} />
                Watch trailer
              </a>
            )}
          </div>

          <div className="animate-rise min-w-0 lg:py-3">
            {/* Desktop-only metadata label. */}
            <div className="mb-3 hidden flex-wrap items-center gap-2 lg:flex">
              <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-md">
                MOVIE DETAILS
              </span>

              {year && (
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/70">
                  {year}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl lg:max-w-4xl lg:text-6xl xl:text-7xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-2 text-sm italic text-white/70 sm:text-base lg:mt-3 lg:text-lg lg:text-white/75">
                {movie.tagline}
              </p>
            )}

            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80 lg:mt-5 lg:text-[15px] lg:text-white/75">
              {meta.map((item, index) => (
                <span
                  key={`${item}-${index}`}
                  className="inline-flex items-center gap-2.5"
                >
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-1 w-1 rounded-full bg-white/45 lg:block"
                    />
                  )}
                  {item}
                </span>
              ))}
            </p>

            <div className="mt-3 flex items-center gap-2 text-sm text-white/70 lg:mt-4 lg:gap-2.5">
              <Star
                size={18}
                fill="currentColor"
                strokeWidth={0}
                className="text-gold lg:h-[19px] lg:w-[19px]"
              />

              <span className="text-lg font-bold text-white lg:text-xl">
                {Number(movie.vote_average ?? 0).toFixed(1)}
                <span className="ml-1 text-sm font-medium text-white/65 lg:hidden">
                  / 10
                </span>
              </span>

              <span className="lg:hidden">/ 10</span>
              <span className="hidden text-white/45 lg:inline">•</span>
              <span className="hidden lg:inline">TMDB rating</span>

              {director && (
                <span className="ml-2 hidden border-l border-white/20 pl-3 lg:inline">
                  Directed by{" "}
                  <strong className="font-semibold text-white">
                    {director.name}
                  </strong>
                </span>
              )}
            </div>

            {/* Desktop overview and action buttons. */}
            <div className="hidden lg:block">
              {movie.overview && (
                <div className="mt-6 max-w-3xl">
                  <p
                    className={cn(
                      "text-[15px] leading-7 text-white/80",
                      expanded ? "" : "line-clamp-4",
                    )}
                  >
                    {movie.overview}
                  </p>

                  {longOverview && (
                    <button
                      type="button"
                      onClick={() => setExpanded((value) => !value)}
                      aria-expanded={expanded}
                      className="mt-1 text-sm font-semibold text-brand transition hover:brightness-125"
                    >
                      {expanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <WatchlistButton
                  tmdbId={Number(movie.id)}
                  variant="button"
                  className="min-w-0 sm:flex-none"
                />

                <FavoriteButton tmdbId={Number(movie.id)} variant="button" />

                <button
                  type="button"
                  onClick={() => void handleShare()}
                  aria-label="Share"
                  className={cn(desktopGhost, "px-4")}
                >
                  <Share2 size={16} />
                  <span>{shared ? "Link copied" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Desktop-only information strip. */}
            <div className="mt-8 hidden max-w-5xl grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl lg:grid">
              <div className="flex min-w-0 items-center gap-3 border-r border-white/10 px-4 py-4 xl:px-5">
                <CalendarDays className="shrink-0 text-white/65" size={19} />
                <div className="min-w-0">
                  <p className="text-xs text-white/50">Release date</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {movie.release_date
                      ? new Date(
                          `${movie.release_date}T12:00:00`,
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 border-r border-white/10 px-4 py-4 xl:px-5">
                <Clock3 className="shrink-0 text-white/65" size={19} />
                <div className="min-w-0">
                  <p className="text-xs text-white/50">Runtime</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {runtime || "Not available"}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center gap-3 px-4 py-4 xl:px-5">
                <Clapperboard className="shrink-0 text-white/65" size={19} />
                <div className="min-w-0">
                  <p className="text-xs text-white/50">Genres</p>
                  <p className="mt-1 truncate text-sm font-semibold text-white">
                    {movie.genres
                      .slice(0, 2)
                      .map((genre) => genre.name)
                      .join(", ") || "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Original mobile/tablet overview and actions. */}
          <div className="col-span-2 mt-2 lg:hidden">
            {movie.overview && (
              <div className="max-w-2xl">
                <p
                  className={cn(
                    "text-sm leading-7 text-white/80 sm:text-base",
                    expanded ? "" : "line-clamp-3",
                  )}
                >
                  {movie.overview}
                </p>

                {longOverview && (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="mt-1 text-sm font-semibold text-brand"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <WatchlistButton
                tmdbId={Number(movie.id)}
                variant="button"
                className="min-w-0 flex-1 sm:flex-none"
              />

              <div className="sm:hidden">
                <FavoriteButton tmdbId={Number(movie.id)} variant="icon" />
              </div>

              <div className="hidden sm:block">
                <FavoriteButton tmdbId={Number(movie.id)} variant="button" />
              </div>

              {trailer && (
                <div className="hidden sm:block lg:hidden">
                  <a href="#trailer" className={cn(ghost, "px-4")}>
                    <Play size={15} fill="currentColor" strokeWidth={0} />
                    Watch Trailer
                  </a>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleShare()}
                aria-label="Share"
                className={cn(ghost, "w-11 px-0 sm:w-auto sm:px-4")}
              >
                <Share2 size={16} />
                <span className="hidden sm:inline">
                  {shared ? "Link copied" : "Share"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
