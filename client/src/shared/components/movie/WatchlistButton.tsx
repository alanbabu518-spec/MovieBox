import { useEffect, useState } from "react";
import { Bookmark, Check } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  addToWatchlist,
  getWatchlistStatus,
  removeFromWatchlist,
} from "../../services/watchlist.api";

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
  const { user } = useAuth();

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsInWatchlist(false);
      return;
    }

    const checkStatus = async () => {
      try {
        setChecking(true);

        const status = await getWatchlistStatus(tmdbId);

        setIsInWatchlist(status);
      } catch {
        setIsInWatchlist(false);
      } finally {
        setChecking(false);
      }
    };

    checkStatus();
  }, [tmdbId, user]);

  const handleToggle = async () => {
    if (!user || loading) {
      return;
    }

    try {
      setLoading(true);

      if (isInWatchlist) {
        await removeFromWatchlist(tmdbId);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(tmdbId);
        setIsInWatchlist(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || checking || !user;

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {isInWatchlist ? (
          <Check size={18} />
        ) : (
          <Bookmark size={18} />
        )}

        {isInWatchlist
          ? "In Watchlist"
          : "Add to Watchlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={
        isInWatchlist
          ? "Remove from watchlist"
          : "Add to watchlist"
      }
      title={
        isInWatchlist
          ? "Remove from watchlist"
          : "Add to watchlist"
      }
      className={`flex h-9 w-9 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isInWatchlist ? (
        <Check size={18} />
      ) : (
        <Bookmark size={18} />
      )}
    </button>
  );
}