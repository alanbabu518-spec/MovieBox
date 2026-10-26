import { Bookmark, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLibraryStore } from "../../../store/library.store";
import { cn } from "../../lib/cn";

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
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const active = useLibraryStore((state) => state.watchlist.has(tmdbId));

  const handleClick = () => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/signin");
      return;
    }

    void useLibraryStore.getState().toggle("watchlist", tmdbId);
  };

  const label = active ? "Remove from watchlist" : "Add to watchlist";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={variant === "icon" ? label : undefined}
      title={label}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-[transform,background-color] duration-150 active:scale-95",
        active
          ? "border border-white/25 bg-white/10 backdrop-blur-md hover:bg-white/20"
          : "bg-brand shadow-[0_10px_30px_-12px_var(--primary)] hover:bg-brand-hover",
        variant === "icon" ? "w-11" : "px-5",
        className,
      )}
    >
      {active ? <Check size={18} /> : <Bookmark size={18} />}

      {variant === "button" && (
        <span>{active ? "In Watchlist" : "Add to Watchlist"}</span>
      )}
    </button>
  );
}