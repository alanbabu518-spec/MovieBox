import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Film, Heart, Plus, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { Movie } from "../../types/movie";
import { useAuth } from "../../context/AuthContext";
import { useLibraryStore } from "../../../store/library.store";
import { cn } from "../../lib/cn";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (movie: Movie, next: boolean) => void;
  action?: ReactNode;
}

const TMDB = "https://image.tmdb.org/t/p";

function releaseBadge(releaseDate: string | null): "New" | "Soon" | null {
  if (!releaseDate) return null;

  const days = (Date.now() - new Date(releaseDate).getTime()) / 86_400_000;

  if (Number.isNaN(days)) return null;
  if (days < 0) return "Soon";

  return days <= 45 ? "New" : null;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const glass =
  "bg-black/50 text-white ring-1 ring-white/15 md:bg-black/35 md:backdrop-blur-md md:backdrop-saturate-150";

function MovieCard({
  movie,
  priority = false,
  className,
  isFavorite,
  onToggleFavorite,
  action,
}: MovieCardProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const storeFavorite = useLibraryStore((state) =>
    state.favorites.has(movie.id),
  );

  const inWatchlist = useLibraryStore((state) =>
    state.watchlist.has(movie.id),
  );

  const favorite = isFavorite ?? storeFavorite;

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [badge] = useState(() => releaseBadge(movie.releaseDate));

  const tiltRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const addRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const canTilt = useRef(false);
  const reduceMotion = useRef(false);

  useEffect(() => {
    canTilt.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return () => cancelAnimationFrame(frame.current);
  }, []);

  const handleEnter = (event: React.PointerEvent) => {
    const tilt = tiltRef.current;

    if (
      !tilt ||
      !canTilt.current ||
      reduceMotion.current ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    tilt.style.willChange = "transform";
    tilt.style.transition = "transform 180ms ease-out";
  };

  const handleMove = (event: React.PointerEvent) => {
    if (
      !canTilt.current ||
      reduceMotion.current ||
      event.pointerType !== "mouse"
    ) {
      return;
    }

    const { clientX, clientY } = event;

    cancelAnimationFrame(frame.current);

    frame.current = requestAnimationFrame(() => {
      const stage = stageRef.current;
      const tilt = tiltRef.current;
      const glare = glareRef.current;

      if (!stage || !tilt) return;

      const rect = stage.getBoundingClientRect();
      const x = clamp((clientX - rect.left) / rect.width);
      const y = clamp((clientY - rect.top) / rect.height);

      tilt.style.transform = `rotateX(${((0.5 - y) * 9).toFixed(2)}deg) rotateY(${((x - 0.5) * 11).toFixed(2)}deg) scale3d(1.04,1.04,1)`;

      if (glare) {
        glare.style.transform = `translate3d(${((x - 0.5) * 70).toFixed(1)}%,${((y - 0.5) * 70).toFixed(1)}%,0)`;
      }
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame.current);

    const tilt = tiltRef.current;

    if (tilt) {
      tilt.style.transition =
        "transform 650ms cubic-bezier(0.16, 1, 0.3, 1)";
      tilt.style.transform = "";
      tilt.style.willChange = "";
    }

    if (glareRef.current) {
      glareRef.current.style.transform = "";
    }
  };

  const pop = (element: HTMLElement | null) => {
    if (!element || reduceMotion.current) return;

    element.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.35)", offset: 0.4 },
        { transform: "scale(1)" },
      ],
      { duration: 360, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
    );
  };

  const parsedYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const year = parsedYear && !Number.isNaN(parsedYear) ? parsedYear : null;
  const rating = movie.rating ?? 0;
  const genres = movie.genres ?? [];
  const hasPoster = Boolean(movie.posterPath) && !imageFailed;
  const meta = [year, genres[0] ?? null].filter(Boolean);

  const requireAuth = (callback: () => void) => {
    if (loading) return;

    if (!user) {
      navigate("/signin");
      return;
    }

    callback();
  };

  const handleOpenMovie = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const handleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    requireAuth(() => {
      const next = !favorite;

      pop(heartRef.current);
      navigator.vibrate?.(10);

      if (onToggleFavorite) {
        onToggleFavorite(movie, next);
      } else {
        void useLibraryStore.getState().toggle("favorites", movie.id);
      }
    });
  };

  const handleWatchlist = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    requireAuth(() => {
      pop(addRef.current);
      navigator.vibrate?.(10);
      void useLibraryStore.getState().toggle("watchlist", movie.id);
    });
  };

  return (
    <article className={cn("group relative min-w-0", className)}>
      <div className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.96] active:duration-100">
        <div
          ref={stageRef}
          onPointerEnter={handleEnter}
          onPointerMove={handleMove}
          onPointerLeave={handleLeave}
          className="relative [perspective:900px]"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2 -bottom-1 -z-10 h-2/3 rounded-3xl opacity-0 shadow-[0_28px_50px_-14px_rgba(0,0,0,0.85)] transition-opacity duration-500 group-hover:opacity-100"
          />

          <div
            ref={tiltRef}
            className="relative aspect-2/3 overflow-hidden rounded-2xl bg-card shadow-[0_10px_28px_-14px_rgba(0,0,0,0.7)]"
          >
            {hasPoster ? (
              <>
                {!imageLoaded && (
                  <div className="skeleton absolute inset-0" aria-hidden="true" />
                )}

                <img
                  src={`${TMDB}/w342${movie.posterPath}`}
                  srcSet={`${TMDB}/w185${movie.posterPath} 185w, ${TMDB}/w342${movie.posterPath} 342w, ${TMDB}/w500${movie.posterPath} 500w`}
                  sizes="(min-width: 1280px) 190px, (min-width: 640px) 22vw, 34vw"
                  alt={`${movie.title} poster`}
                  width={342}
                  height={513}
                  draggable={false}
                  loading={priority ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={priority ? "high" : "auto"}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageFailed(true)}
                  className={cn(
                    "h-full w-full select-none object-cover [-webkit-touch-callout:none] transition-opacity duration-500",
                    imageLoaded ? "opacity-100" : "opacity-0",
                  )}
                />
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-b from-elevated to-card p-3 text-center text-muted">
                <Film size={26} strokeWidth={1.4} />
                <span className="line-clamp-3 text-[11px] font-medium">
                  {movie.title}
                </span>
              </div>
            )}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/55 to-transparent"
            />

            {movie.overview && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-1.5 bg-linear-to-t from-black/90 via-black/65 to-transparent px-3.5 pb-12 pt-14 opacity-0 transition-[opacity,transform] duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
              >
                <p className="line-clamp-3 text-[11.5px] leading-[1.45] tracking-[0.005em] text-white/85">
                  {movie.overview}
                </p>
              </div>
            )}

            <span
              ref={glareRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(255,255,255,0.2),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/12"
            />

            {badge && (
              <span
                className={cn(
                  "pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.08em]",
                  glass,
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    badge === "New" ? "bg-brand" : "bg-sky-400",
                  )}
                />
                {badge}
              </span>
            )}

            {rating > 0 && (
              <span
                aria-label={`Rated ${rating.toFixed(1)} out of 10`}
                className={cn(
                  "pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold leading-none tabular-nums",
                  glass,
                )}
              >
                <Star
                  size={11}
                  fill="currentColor"
                  strokeWidth={0}
                  className="text-gold"
                />
                {rating.toFixed(1)}
              </span>
            )}

            {action ?? (
              <>
                <button
                  type="button"
                  aria-pressed={favorite}
                  aria-label={
                    favorite
                      ? `Remove ${movie.title} from favorites`
                      : `Add ${movie.title} to favorites`
                  }
                  onClick={handleFavorite}
                  className={cn(
                    "absolute right-2 top-2 z-20 grid h-10 w-10 touch-manipulation place-items-center rounded-full transition-transform duration-150 active:scale-90",
                    glass,
                  )}
                >
                  <span ref={heartRef} className="grid place-items-center">
                    <Heart
                      size={18}
                      strokeWidth={2}
                      className={cn(
                        "transition-colors duration-200",
                        favorite
                          ? "fill-red-500 text-red-500"
                          : "text-white",
                      )}
                    />
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={inWatchlist}
                  aria-label={
                    inWatchlist
                      ? `Remove ${movie.title} from watchlist`
                      : `Add ${movie.title} to watchlist`
                  }
                  onClick={handleWatchlist}
                  className={cn(
                    "absolute bottom-2 right-2 z-20 grid h-10 w-10 touch-manipulation place-items-center rounded-full transition-all duration-200 active:scale-90",
                    inWatchlist
                      ? "bg-emerald-500 text-white ring-1 ring-white/20"
                      : glass,
                  )}
                >
                  <span ref={addRef} className="grid place-items-center">
                    {inWatchlist ? (
                      <Check size={18} strokeWidth={2.8} aria-hidden="true" />
                    ) : (
                      <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
                    )}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="px-1 pt-2.5">
        <h3 className="min-w-0 text-[13.5px] font-semibold leading-[1.25] tracking-[-0.011em] sm:text-sm">
          <Link
            to={`/movie/${movie.id}`}
            onClick={handleOpenMovie}
            title={movie.title}
            className="line-clamp-1 rounded-sm after:absolute after:inset-0 after:z-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {movie.title}
          </Link>
        </h3>

        {meta.length > 0 && (
          <p className="mt-1 flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[11.5px] leading-none tracking-[0.005em] text-muted">
            {meta.map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-1.5"
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="h-[3px] w-[3px] rounded-full bg-muted/70"
                  />
                )}
                <span className="truncate">{item}</span>
              </span>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}

export default memo(MovieCard);