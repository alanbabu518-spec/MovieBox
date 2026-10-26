import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLibraryStore } from "../../../store/library.store";
import { cn } from "../../lib/cn";

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
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const active = useLibraryStore((state) => state.favorites.has(tmdbId));

  const handleClick = () => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    void useLibraryStore.getState().toggle("favorites", tmdbId);
  };

  const label = active ? "Remove from favorites" : "Add to favorites";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={variant === "icon" ? label : undefined}
      title={label}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white backdrop-blur-md transition-[transform,background-color] duration-150 hover:bg-white/20 active:scale-95",
        variant === "icon" ? "w-11" : "px-4",
        className,
      )}
    >
      <Heart
        size={18}
        className={cn(active && "fill-brand text-brand")}
      />

      {variant === "button" && (
        <span>{active ? "Favorited" : "Add to Favorites"}</span>
      )}
    </button>
  );
}