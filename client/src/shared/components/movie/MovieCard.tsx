import { memo, useState } from "react";

import { Heart, Play, Star } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import type { Movie } from "../../types/movie";

import { useAuth } from "../../../shared/context/AuthContext";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (
    movie: Movie,
    next: boolean,
  ) => void;
}

const TMDB =
  "https://image.tmdb.org/t/p";

const PLACEHOLDER =
  "/placeholder-movie.jpg";

function ratingTone(rating: number) {
  if (rating >= 7.5) {
    return "#22c55e";
  }

  if (rating >= 6) {
    return "#f5b301";
  }

  return "#ef4444";
}

function MovieCard({
  movie,
  priority = false,
  isFavorite,
  onToggleFavorite,
}: MovieCardProps) {
  const navigate = useNavigate();

  const { user, loading } = useAuth();

  const [imageLoaded, setImageLoaded] =
    useState(false);

  const [imageFailed, setImageFailed] =
    useState(false);

  const [localFavorite, setLocalFavorite] =
    useState(false);

  const [pop, setPop] = useState(false);

  const favorite =
    isFavorite ?? localFavorite;

  const parsedYear = movie.releaseDate
    ? new Date(
        movie.releaseDate,
      ).getFullYear()
    : null;

  const releaseYear =
    parsedYear &&
    !Number.isNaN(parsedYear)
      ? parsedYear
      : null;

  const rating = movie.rating ?? 0;

  const genres = movie.genres ?? [];

  const overview = (
    movie as Movie & {
      overview?: string;
    }
  ).overview;

  const hasPoster =
    Boolean(movie.posterPath) &&
    !imageFailed;

  const poster185 = `${TMDB}/w185${movie.posterPath}`;

  const poster342 = `${TMDB}/w342${movie.posterPath}`;

  const poster500 = `${TMDB}/w500${movie.posterPath}`;

  const detailsHref =
    `/movie/${movie.id}`;

  const handleOpenMovie = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const handleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    const next = !favorite;

    setLocalFavorite(next);

    setPop(true);

    window.setTimeout(() => {
      setPop(false);
    }, 300);

    onToggleFavorite?.(movie, next);
  };

  const meta = [
    releaseYear,
    movie.originalLanguage?.toUpperCase(),
    genres[0],
  ].filter(Boolean);

  return (
    <article className="group relative">
      <div
        className="relative overflow-hidden rounded-lg border transition-all duration-300 active:scale-[0.98] sm:rounded-xl motion-safe:group-hover:-translate-y-1 group-hover:shadow-xl group-focus-within:ring-2 group-focus-within:ring-(--primary)"
        style={{
          backgroundColor:
            "var(--card)",
          borderColor:
            "var(--border)",
        }}
      >
        <div className="relative aspect-2/3 overflow-hidden">
          {!imageLoaded &&
            hasPoster && (
              <div
                className="absolute inset-0 animate-pulse"
                style={{
                  backgroundColor:
                    "var(--border)",
                }}
                aria-hidden="true"
              />
            )}

          {hasPoster ? (
            <img
              src={poster342}
              srcSet={`${poster185} 185w, ${poster342} 342w, ${poster500} 500w`}
              sizes="(min-width: 1280px) 160px, (min-width: 640px) 20vw, 28vw"
              alt={`${movie.title} poster`}
              loading={
                priority
                  ? "eager"
                  : "lazy"
              }
              decoding="async"
              fetchPriority={
                priority
                  ? "high"
                  : "auto"
              }
              width={342}
              height={513}
              onLoad={() =>
                setImageLoaded(true)
              }
              onError={() =>
                setImageFailed(true)
              }
              className={`h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105 ${
                imageLoaded
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
          ) : (
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-2 text-center"
              style={{
                backgroundColor:
                  "var(--card)",
                color:
                  "var(--text-secondary)",
              }}
            >
              <img
                src={PLACEHOLDER}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-30"
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />

              <Play
                size={20}
                strokeWidth={1.5}
                className="relative"
              />

              <span className="relative line-clamp-3 text-[11px] font-medium">
                {movie.title}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent" />

          {rating > 0 && (
            <div
              className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md transition-opacity duration-200 sm:group-hover:opacity-0 sm:group-focus-within:opacity-0"
              aria-label={`Rated ${rating.toFixed(1)} out of 10`}
            >
              <Star
                size={10}
                fill="currentColor"
                strokeWidth={0}
                style={{
                  color:
                    ratingTone(rating),
                }}
              />

              {rating.toFixed(1)}
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 bg-linear-to-t from-black/95 via-black/80 to-transparent px-2.5 pb-2.5 pt-10 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100">
            <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold text-white">
              {rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star
                    size={10}
                    fill="currentColor"
                    strokeWidth={0}
                    style={{
                      color:
                        ratingTone(
                          rating,
                        ),
                    }}
                  />

                  {rating.toFixed(1)}
                </span>
              )}

              {releaseYear && (
                <span className="text-white/70">
                  {releaseYear}
                </span>
              )}
            </div>

            {overview && (
              <p className="mb-2 line-clamp-2 text-[10px] leading-relaxed text-white/80">
                {overview}
              </p>
            )}

            {genres.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {genres
                  .slice(0, 2)
                  .map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/25 px-1.5 py-0.5 text-[9px] font-medium text-white/90"
                    >
                      {genre}
                    </span>
                  ))}
              </div>
            )}

            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-white"
              style={{
                backgroundColor:
                  "var(--primary)",
              }}
            >
              <Play
                size={10}
                fill="currentColor"
                strokeWidth={0}
              />

              View details
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label={
            favorite
              ? `Remove ${movie.title} from favorites`
              : `Add ${movie.title} to favorites`
          }
          aria-pressed={favorite}
          onClick={handleFavorite}
          className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-2 sm:top-2 sm:h-8 sm:w-8"
        >
          <Heart
            size={14}
            strokeWidth={2}
            className={`transition-all duration-200 ${
              favorite
                ? "fill-red-500 text-red-500"
                : "text-white"
            } ${
              pop
                ? "scale-125"
                : "scale-100"
            }`}
          />
        </button>
      </div>

      <div className="px-0.5 pt-2">
        <h3 className="min-w-0 text-[12px] font-semibold leading-snug sm:text-[13px]">
          <Link
            to={detailsHref}
            onClick={handleOpenMovie}
            title={movie.title}
            className="line-clamp-1 transition-colors duration-200 after:absolute after:inset-0 after:z-0 after:content-[''] hover:text-(--primary) focus:outline-none"
            style={{
              color:
                "var(--text-primary)",
            }}
          >
            {movie.title}
          </Link>
        </h3>

        {meta.length > 0 && (
          <p
            className="mt-0.5 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[10px] sm:text-[11px]"
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            {meta.map(
              (item, index) => (
                <span
                  key={`${item}-${index}`}
                  className={`items-center gap-1.5 ${
                    index === 2
                      ? "hidden sm:flex"
                      : "flex"
                  }`}
                >
                  {index > 0 && (
                    <span
                      className="h-0.5 w-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          "var(--text-secondary)",
                      }}
                      aria-hidden="true"
                    />
                  )}

                  {item}
                </span>
              ),
            )}
          </p>
        )}
      </div>
    </article>
  );
}

export default memo(MovieCard);