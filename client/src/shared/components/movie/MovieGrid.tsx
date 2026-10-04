import { Clapperboard } from "lucide-react";

import MovieCard from "./MovieCard";
import type { Movie } from "../../types/movie";

interface MovieGridProps {
  movies: Movie[];
  priorityCount?: number;
  emptyMessage?: string;
}

export default function MovieGrid({
  movies,
  priorityCount = 5,
  emptyMessage = "No movies found.",
}: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-3 rounded-xl border px-6 py-14 text-center"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
      >
        <Clapperboard size={30} strokeWidth={1.4} />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-9 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-10 xl:gap-x-6"
    >
      {movies.map((movie, index) => (
        <li key={movie.id}>
          <MovieCard movie={movie} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}