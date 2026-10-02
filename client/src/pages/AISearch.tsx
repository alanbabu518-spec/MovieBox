import { useState } from "react";
import type {FormEvent} from "react";
import { Search, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  searchWithAI,
  type AISearchMovie,
  type AISearchIntent,
} from "../shared/services/ai.api";

const imageBaseUrl = "https://image.tmdb.org/t/p/w500";

const AISearch = () => {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<AISearchMovie[]>([]);
  const [intent, setIntent] =
    useState<AISearchIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await searchWithAI(trimmedQuery);

      setMovies(result.movies);
      setIntent(result.intent);
    } catch {
      setError(
        "Unable to search movies right now.",
      );
      setMovies([]);
      setIntent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-[#e50914]">
            <Sparkles size={20} />
            <span className="text-sm font-medium">
              MovieBox AI
            </span>
          </div>

          <h1 className="text-3xl font-semibold sm:text-4xl">
            Find movies naturally
          </h1>

          <p className="mt-3 text-sm text-zinc-400 sm:text-base">
            Tell MovieBox what you want to watch.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8"
          >
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#111111] p-2">
              <Search
                size={20}
                className="ml-2 shrink-0 text-zinc-500"
              />

              <input
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Try: Malayalam action movies after 2020"
                className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-zinc-600"
              />

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-[#e50914] px-5 py-3 text-sm font-medium transition hover:bg-[#c70812] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>

        {intent && (
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {intent.genre && (
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                {intent.genre}
              </span>
            )}

            {intent.language && (
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                {intent.language}
              </span>
            )}

            {intent.yearFrom && (
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                {intent.yearFrom}
                {intent.yearTo
                  ? ` - ${intent.yearTo}`
                  : "+"}
              </span>
            )}

            {intent.sortBy && (
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                {intent.sortBy.replace(
                  "_",
                  " ",
                )}
              </span>
            )}
          </div>
        )}

        {error && (
          <p className="mt-8 text-center text-sm text-red-500">
            {error}
          </p>
        )}

        {!loading &&
          !error &&
          movies.length === 0 &&
          intent && (
            <p className="mt-12 text-center text-zinc-500">
              No movies found.
            </p>
          )}

        {movies.length > 0 && (
          <section className="mt-12">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                AI Search Results
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {movies.length} movies found
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/movies/${movie.id}`,
                    )
                  }
                  className="group text-left"
                >
                  <div className="aspect-2/3 overflow-hidden rounded-lg bg-zinc-900">
                    {movie.posterPath ? (
                      <img
                        src={`${imageBaseUrl}${movie.posterPath}`}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-3 text-center text-sm text-zinc-500">
                        No Poster
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 line-clamp-1 text-sm font-medium">
                    {movie.title}
                  </h3>

                  {movie.releaseDate && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {movie.releaseDate.slice(
                        0,
                        4,
                      )}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AISearch;