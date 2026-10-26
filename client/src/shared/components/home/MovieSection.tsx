import { memo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import MovieCard from "../movie/MovieCard";
import SectionHeader from "../ui/Sectionheader";

import type { Movie } from "../../types/movie";

import { useAuth } from "../../context/AuthContext";

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllPath?: string;
  /** kept for backwards compatibility with the old API */
  category?: "trending" | "upcoming" | "popular";
}

function MovieSection({ title, movies, viewAllPath }: MovieSectionProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const rail = useRef<HTMLUListElement>(null);

  if (movies.length === 0) {
    return null;
  }

  const scroll = (direction: 1 | -1) => {
    const node = rail.current;

    node?.scrollBy({
      left: direction * node.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  const gate = (event: React.MouseEvent) => {
    if (loading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const arrow =
    "absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-canvas/85 text-ink opacity-0 backdrop-blur-md transition-[opacity,transform] duration-200 hover:scale-105 group-hover/rail:opacity-100 md:grid";

  return (
    <section className="group/rail mb-10 sm:mb-14" aria-label={title}>
      <SectionHeader
        title={title}
        action={
          viewAllPath && (
            <Link
              to={viewAllPath}
              onClick={gate}
              className="flex items-center gap-0.5 text-sm font-medium text-brand transition-opacity hover:opacity-80"
            >
              See all
              <ChevronRight size={16} />
            </Link>
          )
        }
      />

      <div className="relative">
        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          onClick={() => scroll(-1)}
          className={`${arrow} left-1`}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => scroll(1)}
          className={`${arrow} right-1`}
        >
          <ChevronRight size={20} />
        </button>

        <ul
          ref={rail}
          role="list"
          className="scrollbar-none -mx-4 flex snap-x snap-proximity gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:gap-4 sm:px-6 lg:-mx-8 lg:px-8"
        >
          {movies.map((movie, index) => (
            <li
              key={movie.id}
              className="w-[34vw] max-w-[190px] min-w-[116px] flex-none snap-start sm:w-[172px] lg:w-[188px]"
            >
              <MovieCard movie={movie} priority={index < 4} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default memo(MovieSection);