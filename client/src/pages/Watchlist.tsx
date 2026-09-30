import { useEffect, useState } from "react";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";
import {
  getWatchlist,
  removeFromWatchlist,
  type WatchlistItem,
} from "../shared/services/watchlist.api";

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const loadWatchlist = async () => {
      try {
        setLoading(true);

        const data = await getWatchlist();

        setWatchlist(data);
      } catch {
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlist();
  }, [user, authLoading]);

  const handleRemove = async (tmdbId: number) => {
    try {
      setRemovingId(tmdbId);

      await removeFromWatchlist(tmdbId);

      setWatchlist((current) =>
        current.filter(
          (item) => item.movie.tmdbId !== tmdbId,
        ),
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen px-5 py-10 md:px-8 lg:px-12">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="animate-spin" size={28} />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen px-5 py-10 md:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
          <Bookmark size={48} strokeWidth={1.5} />

          <h1 className="mt-5 text-2xl font-semibold">
            Sign in to view your watchlist
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Save movies you want to watch later.
          </p>

          <Link
            to="/signin"
            className="mt-6 rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-8 md:px-8 lg:px-12">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">
              My Watchlist
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {watchlist.length}{" "}
              {watchlist.length === 1 ? "movie" : "movies"} saved
            </p>
          </div>

          <Bookmark
            size={28}
            className="text-red-600"
          />
        </div>

        {watchlist.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <Bookmark
              size={52}
              strokeWidth={1.5}
              className="text-zinc-400"
            />

            <h2 className="mt-5 text-xl font-semibold">
              Your watchlist is empty
            </h2>

            <p className="mt-2 max-w-md text-sm text-zinc-500">
              Movies you save to your watchlist will appear
              here.
            </p>

            <Link
              to="/movies"
              className="mt-6 rounded-md bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Explore Movies
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {watchlist.map((item) => {
              const movie = item.movie;

              const poster = movie.posterPath
                ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
                : null;

              const year = movie.releaseDate
                ? new Date(movie.releaseDate).getFullYear()
                : null;

              return (
                <article
                  key={item.id}
                  className="group min-w-0"
                >
                  <div className="relative overflow-hidden rounded-md bg-zinc-900">
                    <Link to={`/movie/${movie.tmdbId}`}>
                      {poster ? (
                        <img
                          src={poster}
                          alt={movie.title}
                          className="aspect-2/3 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex aspect-2/3 items-center justify-center bg-zinc-800 px-3 text-center text-sm text-zinc-400">
                          No Poster
                        </div>
                      )}
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(movie.tmdbId)
                      }
                      disabled={removingId === movie.tmdbId}
                      aria-label={`Remove ${movie.title} from watchlist`}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {removingId === movie.tmdbId ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>

                  <Link
                    to={`/movie/${movie.tmdbId}`}
                    className="mt-3 block"
                  >
                    <h2 className="truncate text-sm font-medium">
                      {movie.title}
                    </h2>

                    {year && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {year}
                      </p>
                    )}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}