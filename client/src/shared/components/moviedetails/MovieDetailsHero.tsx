import { useState } from "react";
import { ArrowLeft, Clock, Play, Share2, Star } from "lucide-react";

import WatchlistButton from "../movie/WatchlistButton";
import FavoriteButton from "../movie/FavoriteButton";
import type { MovieDetails } from "../../../shared/services/movie.api";

interface MovieDetailsHeroProps {
  movie: MovieDetails;
  director?: { name: string };
  trailer?: { key: string };
  onBack: () => void;
}

const ghostButton =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 px-4 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2";

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

  const hours = movie.runtime ? Math.floor(movie.runtime / 60) : 0;
  const minutes = movie.runtime ? movie.runtime % 60 : 0;

  const runtime = movie.runtime
    ? hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m`
    : null;

  const longOverview = (movie.overview?.length ?? 0) > 220;

  const handleShare = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: movie.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);

        setTimeout(() => {
          setShared(false);
        }, 2000);
      }
    } catch {}
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-154 sm:h-175">
        {movie.backdrop_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt=""
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: "var(--card)",
            }}
          />
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, var(--background) 4%, transparent 60%), linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 55%, transparent 100%), linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 25%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium text-white/75 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="mt-24 grid grid-cols-[110px_1fr] items-end gap-5 sm:mt-32 sm:grid-cols-[170px_1fr] sm:gap-8 lg:mt-40 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
          <div
            className="overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10"
            style={{
              backgroundColor: "var(--card)",
            }}
          >
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={`${movie.title} poster`}
                className="aspect-2/3 w-full object-cover"
              />
            ) : (
              <div className="flex aspect-2/3 w-full items-center justify-center p-3 text-center text-xs text-white/50">
                {movie.title}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="mt-3 text-sm italic text-white/70 sm:text-base">
                {movie.tagline}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                <Star
                  size={15}
                  fill="currentColor"
                  style={{
                    color: "var(--primary)",
                  }}
                />
                {movie.vote_average.toFixed(1)}
              </span>

              {year && <span>{year}</span>}

              {runtime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} />
                  {runtime}
                </span>
              )}

              {director && (
                <span className="hidden sm:inline">
                  Directed by{" "}
                  <strong className="font-semibold text-white">
                    {director.name}
                  </strong>
                </span>
              )}
            </div>

            {movie.genres.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {movie.genres.slice(0, 4).map((genre) => (
                  <li
                    key={genre.id}
                    className="rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/80 backdrop-blur"
                  >
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-2 mt-6 lg:col-start-2 lg:col-span-1 lg:mt-0">
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
                    onClick={() =>
                      setExpanded((v) => !v)
                    }
                    aria-expanded={expanded}
                    className="mt-1 text-sm font-semibold transition-opacity hover:opacity-80"
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {trailer && (
                <a
                  href="#trailer"
                  className="inline-flex h-11 items-center gap-2 rounded-md px-6 text-sm font-semibold text-white shadow-lg transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    backgroundColor: "var(--primary)",
                  }}
                >
                  <Play
                    size={15}
                    fill="currentColor"
                  />
                  Watch trailer
                </a>
              )}

              <WatchlistButton
                tmdbId={Number(movie.id)}
                variant="button"
              />

              <FavoriteButton
                tmdbId={Number(movie.id)}
                variant="button"
              />

              <button
                type="button"
                onClick={handleShare}
                className={ghostButton}
              >
                <Share2 size={16} />
                {shared ? "Link copied" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}