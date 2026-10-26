import { Heart, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { Movie } from "../../types/movie";

import { useAuth } from "../../context/AuthContext";
import { useLibraryStore } from "../../../store/library.store";
import { cn } from "../../lib/cn";

/** List-view counterpart of <MovieCard /> */
export default function MovieRow({ movie }: { movie: Movie }) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const favorite = useLibraryStore((state) =>
    state.favorites.has(movie.id),
  );

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const open = (event: React.MouseEvent) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const toggle = () => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    void useLibraryStore.getState().toggle("favorites", movie.id);
  };

  return (
    <li className="relative flex gap-3 rounded-2xl border border-line bg-card p-2.5 transition-transform duration-150 active:scale-[0.99]">
      <div className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated sm:h-28 sm:w-[75px]">
        {movie.posterPath && (
          <img
            src={`https://image.tmdb.org/t/p/w185${movie.posterPath}`}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5 pr-10">
        <h3 className="line-clamp-1 text-sm font-semibold sm:text-base">
          <Link
            to={`/movie/${movie.id}`}
            onClick={open}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {movie.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          {movie.rating > 0 && (
            <span className="flex items-center gap-1 font-medium text-ink">
              <Star
                size={12}
                fill="currentColor"
                strokeWidth={0}
                className="text-gold"
              />
              {movie.rating.toFixed(1)}
            </span>
          )}
          {year && <span>{year}</span>}
        </p>

        {movie.overview && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
            {movie.overview}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-pressed={favorite}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        onClick={toggle}
        className="absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/8 text-muted transition-transform duration-150 active:scale-90"
      >
        <Heart
          size={16}
          className={cn(favorite && "fill-brand text-brand")}
        />
      </button>
    </li>
  );
}