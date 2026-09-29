import {
  Heart,
  Play,
  Plus,
  Star,
} from "lucide-react";
import type { MovieDetails } from "../../../shared/services/movie.api";

interface MovieDetailsHeroProps {
  movie: MovieDetails;
  director?: {
    name: string;
  };
  trailer?: {
    key: string;
  };
  onBack: () => void;
}

export default function MovieDetailsHero({
  movie,
  director,
  trailer,
  onBack,
}: MovieDetailsHeroProps) {
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  return (
    <section className="relative overflow-hidden">
      {movie.backdrop_path && (
        <div className="absolute inset-x-0 top-0 h-145 sm:h-155">
          <img
            src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`}
            alt=""
            className="h-full w-full object-cover"
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(10,10,10,0.5) 45%, var(--background) 100%)",
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-8 sm:pb-16 lg:px-8 lg:pt-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 text-sm font-medium transition-opacity hover:opacity-70"
          style={{
            color: "rgba(255,255,255,0.75)",
          }}
        >
          ← Back
        </button>

        <div className="flex min-h-105 items-end sm:min-h-120">
          <div className="grid w-full grid-cols-[1fr_120px] items-end gap-5 sm:grid-cols-[1fr_150px] sm:gap-7 md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[250px_1fr]">
            <div className="order-1 md:order-2">
              <div className="mb-4">
                <span
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                  style={{
                    color: "var(--primary)",
                  }}
                >
                  MovieBox
                </span>
              </div>

              <h1
                className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                style={{
                  color: "#ffffff",
                }}
              >
                {movie.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs uppercase tracking-[0.12em] sm:text-sm">
                {releaseYear && (
                  <span className="text-white/65">
                    {releaseYear}
                  </span>
                )}

                {director && (
                  <>
                    <span className="text-white/40">
                      •
                    </span>

                    <span className="text-white/65">
                      Directed by{" "}
                      <strong className="text-white/90">
                        {director.name}
                      </strong>
                    </span>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white"
                    style={{
                      backgroundColor: "var(--primary)",
                    }}
                  >
                    <Play
                      size={14}
                      fill="currentColor"
                    />
                    Trailer
                  </a>
                )}

                {movie.runtime && (
                  <span className="text-sm text-white/70">
                    {movie.runtime} mins
                  </span>
                )}

                <div className="flex items-center gap-1.5 text-sm">
                  <Star
                    size={15}
                    fill="currentColor"
                    style={{
                      color: "var(--primary)",
                    }}
                  />

                  <span className="font-semibold text-white">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>

              {movie.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {movie.genres.slice(0, 4).map(
                    (genre) => (
                      <span
                        key={genre.id}
                        className="rounded-md border border-white/15 bg-black/20 px-2.5 py-1 text-xs text-white/70"
                      >
                        {genre.name}
                      </span>
                    ),
                  )}
                </div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-md border border-white/15 bg-black/40 px-3.5 py-2 text-sm font-medium text-white"
                >
                  <Plus size={15} />
                  Watchlist
                </button>

                <button
                  type="button"
                  aria-label="Add to favorites"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white"
                >
                  <Heart size={16} />
                </button>
              </div>
            </div>

            <div className="order-2 md:order-1">
              {movie.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full rounded-md shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}