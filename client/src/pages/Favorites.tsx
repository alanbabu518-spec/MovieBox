import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Film, Heart, Loader2, RotateCw, Search, X } from "lucide-react";

import { useAuth } from "../shared/context/AuthContext";
import {
  getFavorites,
  removeFromFavorites,
  type FavoriteItem,
} from "../shared/services/favorites.api";

type SortKey = "recent" | "title" | "newest" | "oldest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
  { value: "newest", label: "Release: newest" },
  { value: "oldest", label: "Release: oldest" },
];

const shell = "min-h-screen px-5 py-10 md:px-8 lg:px-12";
const shellStyle = {
  backgroundColor: "var(--background)",
  color: "var(--text-primary)",
};
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2";

/* ---------- Small pieces ---------- */

function CenteredMessage({
  icon,
  title,
  text,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center text-center">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
      >
        {icon}
      </div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading favorites"
      className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i}>
          <div
            className="aspect-2/3 animate-pulse rounded-lg"
            style={{ backgroundColor: "var(--card)" }}
          />
          <div
            className="mt-3 h-4 w-4/5 animate-pulse rounded"
            style={{ backgroundColor: "var(--card)" }}
          />
          <div
            className="mt-2 h-3 w-1/4 animate-pulse rounded"
            style={{ backgroundColor: "var(--card)" }}
          />
        </div>
      ))}
    </div>
  );
}

function FavoriteCard({
  item,
  removing,
  onRemove,
}: {
  item: FavoriteItem;
  removing: boolean;
  onRemove: (tmdbId: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const { movie } = item;

  const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
  const href = `/movie/${movie.tmdbId}`;

  return (
    <article className="group min-w-0">
      <div
        className="relative overflow-hidden rounded-lg ring-1 ring-white/5"
        style={{ backgroundColor: "var(--card)" }}
      >
        <Link to={href} aria-label={`Open ${movie.title}`} className="block">
          {movie.posterPath ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
              alt={movie.title}
              loading="lazy"
              className="aspect-2/3 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-2/3 w-full flex-col items-center justify-center gap-2 px-3 text-center">
              <Film size={26} style={{ color: "var(--text-secondary)" }} />
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {movie.title}
              </span>
            </div>
          )}
        </Link>

        {/* Bottom scrim so the hover title stays legible */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Remove: always visible on touch, revealed on hover/focus on desktop */}
        {!confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${movie.title} from favorites`}
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-md transition hover:bg-black/85 focus-visible:opacity-100 focus-visible:outline-2 md:opacity-0 md:group-hover:opacity-100"
          >
            <Heart size={16} fill="currentColor" style={{ color: "var(--primary)" }} />
          </button>
        )}

        {/* Two-step confirm prevents accidental removal */}
        {confirming && (
          <div
            role="alertdialog"
            aria-label={`Remove ${movie.title}?`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-3 text-center backdrop-blur-sm"
          >
            <p className="text-sm font-semibold text-white">Remove from favorites?</p>
            <div className="flex gap-2">
              <button
                type="button"
                autoFocus
                disabled={removing}
                onClick={() => onRemove(movie.tmdbId)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--primary)" }}
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Remove
              </button>
              <button
                type="button"
                disabled={removing}
                onClick={() => setConfirming(false)}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/25 px-3 text-xs font-semibold text-white hover:bg-white/10"
              >
                <X size={14} />
                Keep
              </button>
            </div>
          </div>
        )}
      </div>

      <Link to={href} className="mt-3 block">
        <h3 className="truncate text-sm font-semibold transition-opacity group-hover:opacity-80">
          {movie.title}
        </h3>
        {year && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            {year}
          </p>
        )}
      </Link>
    </article>
  );
}

/* ---------- Page ---------- */

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState("");

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      setFavorites(await getFavorites());
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadFavorites();
  }, [user, authLoading, loadFavorites]);

  const handleRemove = async (tmdbId: number) => {
    try {
      setRemovingId(tmdbId);
      setRemoveError("");
      await removeFromFavorites(tmdbId);
      setFavorites((current) => current.filter((i) => i.movie.tmdbId !== tmdbId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      setRemoveError("Couldn't remove that movie. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? favorites.filter((i) => i.movie.title.toLowerCase().includes(q))
      : [...favorites];

    const time = (i: FavoriteItem) =>
      i.movie.releaseDate ? new Date(i.movie.releaseDate).getTime() : 0;

    if (sort === "title") list.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
    if (sort === "newest") list.sort((a, b) => time(b) - time(a));
    if (sort === "oldest") list.sort((a, b) => time(a) - time(b));
    return list; // "recent" keeps the order returned by the API
  }, [favorites, query, sort]);

  /* Auth / loading gates */
  if (authLoading || (user && loading)) {
    return (
      <main className={shell} style={shellStyle}>
        <section className="mx-auto max-w-7xl">
          <div
            className="mb-10 h-10 w-56 animate-pulse rounded"
            style={{ backgroundColor: "var(--card)" }}
          />
          <GridSkeleton />
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={shell} style={shellStyle}>
        <CenteredMessage
          icon={<Heart size={32} strokeWidth={1.5} style={{ color: "var(--primary)" }} />}
          title="Sign in to see your favorites"
          text="Save the movies you love and they'll be waiting for you on any device."
        >
          <Link to="/signin" className={primaryBtn} style={{ backgroundColor: "var(--primary)" }}>
            Sign in
          </Link>
          <Link
            to="/movies"
            className="inline-flex items-center rounded-md border px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
            style={{ borderColor: "var(--border)" }}
          >
            Browse movies
          </Link>
        </CenteredMessage>
      </main>
    );
  }

  if (error) {
    return (
      <main className={shell} style={shellStyle}>
        <CenteredMessage
          icon={<RotateCw size={30} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />}
          title="We couldn't load your favorites"
          text="Your list is safe. Check your connection and try again."
        >
          <button
            type="button"
            onClick={loadFavorites}
            className={primaryBtn}
            style={{ backgroundColor: "var(--primary)" }}
          >
            <RotateCw size={15} />
            Try again
          </button>
        </CenteredMessage>
      </main>
    );
  }

  const hasFavorites = favorites.length > 0;

  return (
    <main className={shell} style={shellStyle}>
      <section className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">Favorites</h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {hasFavorites
                ? `${favorites.length} ${favorites.length === 1 ? "movie" : "movies"} you love`
                : "The movies you love, all in one place."}
            </p>
          </div>

          {hasFavorites && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block sm:w-64">
                <span className="sr-only">Search your favorites</span>
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--text-secondary)" }}
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search favorites"
                  className="h-10 w-full rounded-md border bg-transparent pl-9 pr-3 text-sm outline-none focus-visible:ring-2"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--card)" }}
                />
              </label>

              <label className="block">
                <span className="sr-only">Sort favorites</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-10 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-2 sm:w-auto"
                  style={{
                    borderColor: "var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--text-primary)",
                  }}
                >
                  {SORTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </header>

        {removeError && (
          <p role="alert" className="mt-6 text-sm text-red-500">
            {removeError}
          </p>
        )}

        {/* Content */}
        <div className="mt-10">
          {!hasFavorites ? (
            <CenteredMessage
              icon={<Heart size={32} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />}
              title="No favorites yet"
              text="Tap the heart on any movie to save it here, so you can find it again in a second."
            >
              <Link to="/movies" className={primaryBtn} style={{ backgroundColor: "var(--primary)" }}>
                Explore movies
              </Link>
            </CenteredMessage>
          ) : visible.length === 0 ? (
            <CenteredMessage
              icon={<Search size={30} strokeWidth={1.5} style={{ color: "var(--text-secondary)" }} />}
              title="No matches"
              text={`Nothing in your favorites matches "${query.trim()}".`}
            >
              <button
                type="button"
                onClick={() => setQuery("")}
                className="rounded-md border px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
                style={{ borderColor: "var(--border)" }}
              >
                Clear search
              </button>
            </CenteredMessage>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {visible.map((item) => (
                <FavoriteCard
                  key={item.id}
                  item={item}
                  removing={removingId === item.movie.tmdbId}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}