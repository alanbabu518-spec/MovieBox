import { useState } from "react";
import { Heart } from "lucide-react";

import { useLibraryStore } from "../../../store/library.store";

interface FavoriteButtonProps {
  tmdbId: number;
  variant?: "icon" | "button";
  className?: string;
}

export default function FavoriteButton({
  tmdbId,
  variant = "icon",
  className = "",
}: FavoriteButtonProps) {
  const isFavorite = useLibraryStore((state) => state.favorites.has(tmdbId));

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
      const success = await toggle("favorites", tmdbId);

      if (!success) {
        setError("Unable to update favorites. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const label = isFavorite ? "Remove from favorites" : "Add to favorites";

  return (
    <div className="relative inline-flex min-w-0 flex-col items-center">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={pending}
        aria-label={label}
        aria-pressed={isFavorite}
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
        <Heart
          size={20}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-current"}
        />

        {variant === "button" && (
          <span>{isFavorite ? "Favorited" : "Add to Favorites"}</span>
        )}

        {pending && (
          <span className="sr-only" role="status">
            Updating favorites...
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
