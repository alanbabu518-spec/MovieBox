import { useState } from "react";
import { Bookmark } from "lucide-react";

import { useLibraryStore } from "../../../store/library.store";

interface WatchlistButtonProps {
  tmdbId: number;
  variant?: "icon" | "button";
  className?: string;
}

export default function WatchlistButton({
  tmdbId,
  variant = "icon",
  className = "",
}: WatchlistButtonProps) {
  const isInWatchlist = useLibraryStore((state) => state.watchlist.has(tmdbId));

  const toggle = useLibraryStore((state) => state.toggle);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (pending) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const success = await toggle("watchlist", tmdbId);

      if (!success) {
        setError("Unable to update your watchlist. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const label = isInWatchlist ? "Remove from watchlist" : "Add to watchlist";

  return (
    <div className="relative inline-flex min-w-0 flex-col items-center">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={pending}
        aria-label={label}
        aria-pressed={isInWatchlist}
        title={error || label}
        className={[
          "inline-flex items-center justify-center gap-2",
          "transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variant === "button"
            ? "min-h-11 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md hover:bg-white/20 active:scale-95"
            : "",
          className,
        ].join(" ")}
      >
        <Bookmark
          size={20}
          className={isInWatchlist ? "fill-current" : "text-current"}
        />

        {variant === "button" && (
          <span>{isInWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
        )}

        {pending && (
          <span className="sr-only" role="status">
            Updating watchlist...
          </span>
        )}
      </button>

      {error && (
        <span className="sr-only" role="status" aria-live="polite">
          {error}
        </span>
      )}
    </div>
  );
}
