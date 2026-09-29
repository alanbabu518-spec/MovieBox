import { memo } from "react";
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Movie } from "../../types/movie";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
}

function MovieCard({
  movie,
  priority = false,
}: MovieCardProps) {
  const navigate = useNavigate();

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const rating = movie.rating ?? 0;

  const handleOpenMovie = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      handleOpenMovie();
    }
  };

  const handleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
  };

  return (
    <article
      className="group cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={handleOpenMovie}
      onKeyDown={handleKeyDown}
      aria-label={`View ${movie.title}`}
    >
      <div
        className="relative overflow-hidden rounded-[3px]"
        style={{
          backgroundColor: "var(--card)",
        }}
      >
        <img
          src={movie.posterUrl}
          alt={`${movie.title} poster`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={
            priority ? "high" : "auto"
          }
          width={342}
          height={513}
          className="aspect-2/3 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />

        <div className="absolute left-2 top-2">
          <span
            className="inline-flex max-w-100px truncate px-2 py-1 text-[9px] font-medium uppercase tracking-wide"
            style={{
              backgroundColor:
                "rgba(255,255,255,0.9)",
              color: "#18181b",
            }}
          >
            Thriller
          </span>
        </div>

        <button
          type="button"
          aria-label={`Add ${movie.title} to favorites`}
          onClick={handleFavorite}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-white/90 text-zinc-700 transition-all duration-200 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white"
        >
          <Heart
            size={15}
            strokeWidth={1.8}
          />
        </button>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="min-w-0 truncate text-[15px] font-medium"
            style={{
              color: "var(--text-primary)",
            }}
            title={movie.title}
          >
            {movie.title}
          </h3>

          {rating > 0 && (
            <span
              className="flex shrink-0 items-center gap-1 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <Star
                size={12}
                fill="currentColor"
                style={{
                  color: "var(--primary)",
                }}
              />

              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <div
          className="mt-1 flex items-center gap-2 text-[11px]"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {releaseYear && (
            <span>{releaseYear}</span>
          )}

          <span>•</span>

          <span>Movie</span>
        </div>
      </div>
    </article>
  );
}

export default memo(MovieCard);