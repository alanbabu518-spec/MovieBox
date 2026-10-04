import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Bookmark,
  LayoutGrid,
  List,
  Loader2,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";
import {
  getWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "../shared/services/watchlist.api";

type SortKey = "recent" | "title" | "year" | "rating";
type ViewMode = "grid" | "list";

// Optional fields: used when your API returns them, ignored otherwise.
type MovieExtras = {
  voteAverage?: number;
  overview?: string;
};
type ItemExtras = { createdAt?: string };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently added" },
  { key: "title", label: "Title A–Z" },
  { key: "year", label: "Release year" },
  { key: "rating", label: "Rating" },
];

const yearOf = (date?: string | null) =>
  date ? new Date(date).getFullYear() : 0;

const posterUrl = (path?: string | null, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>(() => {
    try {
      return (localStorage.getItem("watchlist-view") as ViewMode) || "grid";
    } catch {
      return "grid";
    }
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      setWatchlist(await getWatchlist());
    } catch {
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
    load();
  }, [user, authLoading, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const changeView = (next: ViewMode) => {
    setView(next);
    try {
      localStorage.setItem("watchlist-view", next);
    } catch {
      /* ignore */
    }
  };

  // Optimistic remove: item disappears instantly, comes back if the API fails.
  const handleRemove = async (item: WatchlistItem) => {
    const tmdbId = item.movie.tmdbId;
    const snapshot = watchlist;

    setRemovingId(tmdbId);
    setWatchlist((cur) => cur.filter((i) => i.movie.tmdbId !== tmdbId));

    try {
      await removeFromWatchlist(tmdbId);
      setToast(`Removed "${item.movie.title}"`);
    } catch {
      setWatchlist(snapshot);
      setToast("Couldn't remove that movie. Try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? watchlist.filter((i) => i.movie.title.toLowerCase().includes(q))
      : watchlist;

    const rating = (i: WatchlistItem) =>
      (i.movie as MovieExtras).voteAverage ?? 0;
    const added = (i: WatchlistItem) =>
      new Date((i as ItemExtras).createdAt ?? 0).getTime();

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "title":
          return a.movie.title.localeCompare(b.movie.title);
        case "year":
          return yearOf(b.movie.releaseDate) - yearOf(a.movie.releaseDate);
        case "rating":
          return rating(b) - rating(a);
        default:
          // newest first; falls back to API order when no date is available
          return added(b) - added(a);
      }
    });
  }, [watchlist, query, sort]);

  /* ---------- States ---------- */

  if (authLoading || loading) {
    return (
      <Shell>
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-2/3 animate-pulse rounded-md bg-zinc-800" />
              <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <Message
          icon={<Bookmark size={48} strokeWidth={1.5} />}
          title="Sign in to view your watchlist"
          text="Save movies you want to watch later and find them on any device."
          cta={{ to: "/signin", label: "Sign in" }}
        />
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <Message
          icon={<AlertCircle size={48} strokeWidth={1.5} />}
          title="Couldn't load your watchlist"
          text="Check your connection and try again."
          action={{ onClick: load, label: "Try again" }}
        />
      </Shell>
    );
  }

  if (watchlist.length === 0) {
    return (
      <Shell>
        <Message
          icon={<Bookmark size={52} strokeWidth={1.5} className="text-zinc-400" />}
          title="Your watchlist is empty"
          text="Tap the bookmark on any movie to save it here."
          cta={{ to: "/movies", label: "Explore movies" }}
        />
      </Shell>
    );
  }

  /* ---------- Main ---------- */

  return (
    <Shell>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">My watchlist</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {watchlist.length} {watchlist.length === 1 ? "movie" : "movies"} saved
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your watchlist"
              aria-label="Search your watchlist"
              className="w-full rounded-md border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-8 text-sm outline-none transition focus:border-red-600"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort watchlist"
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-red-600"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <div className="flex overflow-hidden rounded-md border border-zinc-800">
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([mode, Icon, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeView(mode)}
                aria-label={label}
                aria-pressed={view === mode}
                className={`px-3 py-2 transition ${
                  view === mode
                    ? "bg-red-600 text-white"
                    : "bg-zinc-900 text-zinc-400 hover:text-white"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
          <Search size={40} strokeWidth={1.5} className="text-zinc-500" />
          <h2 className="mt-4 text-lg font-semibold">No matches</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Nothing in your watchlist matches "{query}".
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-5 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium transition hover:bg-zinc-700"
          >
            Clear search
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((item) => (
            <GridCard
              key={item.id}
              item={item}
              removing={removingId === item.movie.tmdbId}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-zinc-800/80">
          {visible.map((item) => (
            <ListRow
              key={item.id}
              item={item}
              removing={removingId === item.movie.tmdbId}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-lg"
        >
          {toast}
        </div>
      )}
    </Shell>
  );
}

/* ---------- Pieces ---------- */

type CardProps = {
  item: WatchlistItem;
  removing: boolean;
  onRemove: (item: WatchlistItem) => void;
};

function Rating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400">
      <Star size={12} fill="currentColor" />
      {value.toFixed(1)}
    </span>
  );
}

function RemoveButton({
  item,
  removing,
  onRemove,
  className = "",
}: CardProps & { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => onRemove(item)}
      disabled={removing}
      aria-label={`Remove ${item.movie.title} from watchlist`}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-red-600 focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50 ${className}`}
    >
      {removing ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Trash2 size={16} />
      )}
    </button>
  );
}

function GridCard({ item, removing, onRemove }: CardProps) {
  const movie = item.movie;
  const extras = movie as MovieExtras;
  const poster = posterUrl(movie.posterPath);
  const year = yearOf(movie.releaseDate);

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-md bg-zinc-900">
        <Link to={`/movie/${movie.tmdbId}`} className="block">
          {poster ? (
            <img
              src={poster}
              alt={movie.title}
              loading="lazy"
              className="aspect-2/3 w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center bg-zinc-800 px-3 text-center text-sm text-zinc-400">
              {movie.title}
            </div>
          )}

          {extras.overview && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/70 to-transparent p-3 pt-12 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
              <p className="line-clamp-4 text-xs leading-relaxed text-zinc-200">
                {extras.overview}
              </p>
            </div>
          )}
        </Link>

        <RemoveButton
          item={item}
          removing={removing}
          onRemove={onRemove}
          className="absolute right-2 top-2 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        />
      </div>

      <Link to={`/movie/${movie.tmdbId}`} className="mt-3 block">
        <h2 className="truncate text-sm font-medium">{movie.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
          {year > 0 && <span>{year}</span>}
          <Rating value={extras.voteAverage} />
        </div>
      </Link>
    </article>
  );
}

function ListRow({ item, removing, onRemove }: CardProps) {
  const movie = item.movie;
  const extras = movie as MovieExtras;
  const poster = posterUrl(movie.posterPath, "w185");
  const year = yearOf(movie.releaseDate);

  return (
    <li className="flex gap-4 py-4">
      <Link to={`/movie/${movie.tmdbId}`} className="shrink-0">
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="aspect-2/3 w-16 rounded-md object-cover sm:w-20"
          />
        ) : (
          <div className="flex aspect-2/3 w-16 items-center justify-center rounded-md bg-zinc-800 text-xs text-zinc-400 sm:w-20">
            No poster
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link to={`/movie/${movie.tmdbId}`}>
          <h2 className="truncate font-medium hover:underline">{movie.title}</h2>
        </Link>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
          {year > 0 && <span>{year}</span>}
          <Rating value={extras.voteAverage} />
        </div>
        {extras.overview && (
          <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-zinc-400">
            {extras.overview}
          </p>
        )}
      </div>

      <RemoveButton
        item={item}
        removing={removing}
        onRemove={onRemove}
        className="shrink-0 self-center bg-zinc-800"
      />
    </li>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">{children}</section>
    </main>
  );
}

function Message({
  icon,
  title,
  text,
  cta,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  cta?: { to: string; label: string };
  action?: { onClick: () => void; label: string };
}) {
  const btn =
    "mt-6 rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700";
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      {icon}
      <h1 className="mt-5 text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{text}</p>
      {cta && (
        <Link to={cta.to} className={btn}>
          {cta.label}
        </Link>
      )}
      {action && (
        <button type="button" onClick={action.onClick} className={btn}>
          {action.label}
        </button>
      )}
    </div>
  );
}