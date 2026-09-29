import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TrieMovie } from "../../utils/movieTrie";

interface SearchSuggestionsProps {
  suggestions: TrieMovie[];
  query: string;
  onSelect: () => void;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w92";

export default function SearchSuggestions({
  suggestions,
  query,
  onSelect,
}: SearchSuggestionsProps) {
  const navigate = useNavigate();

  if (!query.trim() || suggestions.length === 0) {
    return null;
  }

  const handleSelect = (movie: TrieMovie) => {
    onSelect();
    navigate(`/movie/${movie.id}`);
  };

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-2xl"
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      <div className="px-4 py-3">
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--text-secondary)" }}
        >
          Suggestions
        </p>
      </div>

      <div>
        {suggestions.map((movie) => {
          const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : null;

          return (
            <button
              key={movie.id}
              type="button"
              onClick={() => handleSelect(movie)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div
                className="flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded"
                style={{ backgroundColor: "var(--card)" }}
              >
                {movie.poster_path ? (
                  <img
                    src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                    alt={movie.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Search
                    size={14}
                    style={{ color: "var(--text-secondary)" }}
                  />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {movie.title}
                </p>

                {year && (
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {year}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}