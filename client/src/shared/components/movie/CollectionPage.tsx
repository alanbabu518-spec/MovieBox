import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  LayoutGrid,
  List,
  Loader2,
  RotateCw,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "../layout/Navbar";
import MovieCard from "./MovieCard";

import type { Movie } from "../../types/movie";

import { useAuth } from "../../context/AuthContext";
import { useLibraryStore, type LibraryKind } from "../../../store/library.store";
import { cn } from "../../lib/cn";

interface CollectionEntry {
  id: string;
  movie: {
    tmdbId: number;
    title: string;
    posterPath: string | null;
    releaseDate: string | null;
  };
}

type SortKey = "recent" | "title" | "newest" | "oldest";
type ViewMode = "grid" | "list";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "title", label: "Title A–Z" },
  { value: "newest", label: "Release: newest" },
  { value: "oldest", label: "Release: oldest" },
];

interface CollectionPageProps {
  kind: LibraryKind;
  title: string;
  icon: LucideIcon;
  countLabel: (count: number) => string;
  emptyTitle: string;
  emptyText: string;
  signedOutTitle: string;
  load: () => Promise<CollectionEntry[]>;
  remove: (tmdbId: number) => Promise<unknown>;
}

const GRID =
  "grid grid-cols-3 gap-x-2.5 gap-y-5 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-7 md:grid-cols-5 xl:grid-cols-6";

function readView(): ViewMode {
  try {
    return localStorage.getItem("moviebox-collection-view") === "list"
      ? "list"
      : "grid";
  } catch {
    return "grid";
  }
}

function Message({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center text-center">
      <div className="mb-6 grid h-20 w-20 place-items-center rounded-full border border-line bg-card">
        {icon}
      </div>

      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}

const primary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-[transform,background-color] hover:bg-brand-hover active:scale-95";

const toMovie = (entry: CollectionEntry): Movie => ({
  id: entry.movie.tmdbId,
  title: entry.movie.title,
  overview: "",
  posterPath: entry.movie.posterPath,
  backdropPath: null,
  releaseDate: entry.movie.releaseDate,
  rating: 0,
  voteCount: 0,
  popularity: 0,
  originalLanguage: "",
  genreIds: [],
  genres: [],
});

export default function CollectionPage({
  kind,
  title,
  icon: Icon,
  countLabel,
  emptyTitle,
  emptyText,
  signedOutTitle,
  load,
  remove,
}: CollectionPageProps) {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<CollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [view, setView] = useState<ViewMode>(readView);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      setItems(await load());
    } catch (err) {
      console.error(`Failed to load ${kind}:`, err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // `load` is a stable module-level function from the page wrapper
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    void fetchItems();
  }, [user, authLoading, fetchItems]);

  const changeView = (next: ViewMode) => {
    setView(next);

    try {
      localStorage.setItem("moviebox-collection-view", next);
    } catch {
      /* private mode */
    }
  };

  const handleRemove = async (tmdbId: number) => {
    try {
      setRemovingId(tmdbId);
      setRemoveError("");

      await remove(tmdbId);

      useLibraryStore.getState().mark(kind, tmdbId, false);
      setItems((current) =>
        current.filter((entry) => entry.movie.tmdbId !== tmdbId),
      );
      setConfirmId(null);
    } catch (err) {
      console.error(`Failed to remove from ${kind}:`, err);
      setRemoveError("Couldn’t remove that movie. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = q
      ? items.filter((entry) => entry.movie.title.toLowerCase().includes(q))
      : [...items];

    const time = (entry: CollectionEntry) =>
      entry.movie.releaseDate ? new Date(entry.movie.releaseDate).getTime() : 0;

    if (sort === "title") {
      list.sort((a, b) => a.movie.title.localeCompare(b.movie.title));
    }

    if (sort === "newest") {
      list.sort((a, b) => time(b) - time(a));
    }

    if (sort === "oldest") {
      list.sort((a, b) => time(a) - time(b));
    }

    return list;
  }, [items, query, sort]);

  const shell = (children: ReactNode) => (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        {children}
      </main>
    </div>
  );

  if (authLoading || (user && loading)) {
    return shell(
      <div role="status" aria-label={`Loading ${title}`}>
        <div className="skeleton mb-8 h-12 w-64 rounded-xl" />

        <div className={GRID}>
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="skeleton aspect-2/3 rounded-xl" />
          ))}
        </div>
      </div>,
    );
  }

  if (!user) {
    return shell(
      <Message
        icon={<Icon size={32} strokeWidth={1.5} className="text-brand" />}
        title={signedOutTitle}
        text="Sign in to keep your movies in one place, on any device."
      >
        <Link to="/signin" className={primary}>
          Sign in
        </Link>

        <Link
          to="/movies"
          className="inline-flex h-11 items-center rounded-xl border border-line px-6 text-sm font-semibold hover:bg-white/5"
        >
          Browse movies
        </Link>
      </Message>,
    );
  }

  if (error) {
    return shell(
      <Message
        icon={<RotateCw size={30} strokeWidth={1.5} className="text-muted" />}
        title={`We couldn’t load your ${title.toLowerCase()}`}
        text="Your list is safe. Check your connection and try again."
      >
        <button type="button" onClick={() => void fetchItems()} className={primary}>
          <RotateCw size={15} />
          Try again
        </button>
      </Message>,
    );
  }

  const hasItems = items.length > 0;

  return shell(
    <>
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
            <Icon size={28} fill="currentColor" strokeWidth={1.5} />
          </span>

          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {title}
            </h1>

            <p className="mt-0.5 text-sm text-muted">
              {hasItems ? countLabel(items.length) : emptyText}
            </p>
          </div>
        </div>

        {hasItems && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative block sm:w-64">
              <span className="sr-only">Search {title}</span>

              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${title.toLowerCase()}`}
                className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none focus:border-brand/70"
              />
            </label>

            <div className="flex gap-2">
              <label className="min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Sort</span>

                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortKey)}
                  className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand/70"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div
                role="group"
                aria-label="View"
                className="flex rounded-xl border border-line bg-surface p-1"
              >
                {(
                  [
                    ["grid", LayoutGrid, "Grid view"],
                    ["list", List, "List view"],
                  ] as const
                ).map(([mode, ViewIcon, label]) => (
                  <button
                    key={mode}
                    type="button"
                    aria-label={label}
                    aria-pressed={view === mode}
                    onClick={() => changeView(mode)}
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-lg transition-colors",
                      view === mode ? "bg-brand text-white" : "text-muted",
                    )}
                  >
                    <ViewIcon size={16} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {removeError && (
        <p role="alert" className="mt-5 text-sm text-red-400">
          {removeError}
        </p>
      )}

      <div className="mt-8">
        {!hasItems ? (
          <Message
            icon={<Icon size={32} strokeWidth={1.5} className="text-muted" />}
            title={emptyTitle}
            text={emptyText}
          >
            <Link to="/movies" className={primary}>
              Explore movies
            </Link>
          </Message>
        ) : visible.length === 0 ? (
          <Message
            icon={<Search size={30} strokeWidth={1.5} className="text-muted" />}
            title="No matches"
            text={`Nothing here matches “${query.trim()}”.`}
          >
            <button
              type="button"
              onClick={() => setQuery("")}
              className="h-11 rounded-xl border border-line px-6 text-sm font-semibold hover:bg-white/5"
            >
              Clear search
            </button>
          </Message>
        ) : view === "grid" ? (
          <ul role="list" className={GRID}>
            {visible.map((entry) => {
              const id = entry.movie.tmdbId;

              return (
                <li key={entry.id} className="relative min-w-0">
                  <MovieCard
                    movie={toMovie(entry)}
                    action={
                      <button
                        type="button"
                        aria-label={`Remove ${entry.movie.title}`}
                        onClick={() => setConfirmId(id)}
                        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/55 text-brand backdrop-blur-md before:absolute before:-inset-1.5 before:content-[''] active:scale-90"
                      >
                        <Icon size={15} fill="currentColor" strokeWidth={1.5} />
                      </button>
                    }
                  />

                  {confirmId === id && (
                    <div
                      role="alertdialog"
                      aria-label={`Remove ${entry.movie.title}?`}
                      className="animate-fade absolute inset-x-0 top-0 z-20 flex aspect-2/3 flex-col items-center justify-center gap-3 rounded-xl bg-black/85 p-3 text-center"
                    >
                      <p className="text-sm font-semibold text-white">
                        Remove from {title.toLowerCase()}?
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          autoFocus
                          disabled={removingId === id}
                          onClick={() => void handleRemove(id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {removingId === id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Remove
                        </button>

                        <button
                          type="button"
                          disabled={removingId === id}
                          onClick={() => setConfirmId(null)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/25 px-3 text-xs font-semibold text-white"
                        >
                          <X size={14} />
                          Keep
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul role="list" className="grid gap-3 xl:grid-cols-2">
            {visible.map((entry) => {
              const id = entry.movie.tmdbId;
              const year = entry.movie.releaseDate
                ? new Date(entry.movie.releaseDate).getFullYear()
                : null;

              return (
                <li
                  key={entry.id}
                  className="relative flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5"
                >
                  <Link
                    to={`/movie/${id}`}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated">
                      {entry.movie.posterPath && (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${entry.movie.posterPath}`}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {entry.movie.title}
                      </span>

                      {year && (
                        <span className="mt-1 block text-xs text-muted">
                          {year}
                        </span>
                      )}
                    </span>
                  </Link>

                  {confirmId === id ? (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        disabled={removingId === id}
                        onClick={() => void handleRemove(id)}
                        className="h-9 rounded-lg bg-brand px-3 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        Remove
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="h-9 rounded-lg border border-line px-3 text-xs font-semibold"
                      >
                        Keep
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove ${entry.movie.title}`}
                      onClick={() => setConfirmId(id)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/8 text-brand active:scale-90"
                    >
                      <Icon size={17} fill="currentColor" strokeWidth={1.5} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>,
  );
}