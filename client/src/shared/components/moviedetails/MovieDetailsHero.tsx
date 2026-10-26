import { useState } from "react";
import { cn } from "../../lib/cn";
import { ArrowLeft, Play, Share2, Star } from "lucide-react";

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
      /* share dismissed */
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
      <div className="absolute inset-x-0 top-0 -z-10 h-[78svh] min-h-[520px] md:h-[88svh] md:max-h-[860px]">
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt=""
            fetchPriority="high"
            className="animate-fade h-full w-full object-cover object-top"
          />
        ) : (
          <div className="h-full w-full bg-card" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--background)_6%,transparent_62%),linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.25)_55%,transparent_100%),linear-gradient(to_bottom,rgba(0,0,0,0.6)_0%,transparent_28%)]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full bg-black/35 py-1.5 pl-2.5 pr-4 text-sm font-medium text-white backdrop-blur-md transition-transform active:scale-95"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-16 grid grid-cols-[112px_1fr] items-end gap-4 sm:mt-24 sm:grid-cols-[170px_1fr] sm:gap-8 lg:mt-36 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
          <div className="overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-white/15">
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

          <div className="animate-rise min-w-0">
            <h1 className="font-display text-3xl font-extrabold leading-[1.04] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-2 text-sm italic text-white/70 sm:text-base">
                {movie.tagline}
              </p>
            )}

            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
              {meta.map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </p>

            <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
              <Star
                size={18}
                fill="currentColor"
                strokeWidth={0}
                className="text-gold"
              />

              <span className="text-lg font-bold text-white">
                {movie.vote_average.toFixed(1)}
              </span>

              <span>/ 10</span>

              {director && (
                <span className="ml-2 hidden border-l border-white/20 pl-3 sm:inline">
                  Directed by{" "}
                  <strong className="font-semibold text-white">
                    {director.name}
                  </strong>
                </span>
              )}
            </p>
          </div>

          <div className="col-span-2 mt-2 lg:col-span-1 lg:col-start-2 lg:mt-0">
            {movie.overview && (
              <div className="max-w-2xl">
                <p
                  className={`text-sm leading-7 text-white/80 sm:text-base ${
                    expanded ? "" : "line-clamp-3"
                  }`}
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
                <div className="hidden sm:block">
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
                className={cn(ghost, "w-11 sm:w-auto sm:px-4")}
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