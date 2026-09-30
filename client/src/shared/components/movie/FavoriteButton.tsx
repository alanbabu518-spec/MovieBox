import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import {
  addToFavorites,
  getFavoriteStatus,
  removeFromFavorites,
} from "../../services/favorites.api";

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
  const { user } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsFavorite(false);
      return;
    }

    const checkStatus = async () => {
      try {
        setChecking(true);

        const status = await getFavoriteStatus(tmdbId);

        setIsFavorite(status);
      } catch {
        setIsFavorite(false);
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

      if (isFavorite) {
        await removeFromFavorites(tmdbId);
        setIsFavorite(false);
      } else {
        await addToFavorites(tmdbId);
        setIsFavorite(true);
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
        <Heart
          size={18}
          fill={isFavorite ? "currentColor" : "none"}
        />

        {isFavorite
          ? "Added to Favorites"
          : "Add to Favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      aria-label={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      title={
        isFavorite
          ? "Remove from favorites"
          : "Add to favorites"
      }
      className={`flex h-9 w-9 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Heart
        size={18}
        fill={isFavorite ? "currentColor" : "none"}
      />
    </button>
  );
}