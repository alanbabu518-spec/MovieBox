import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionHeader from "../ui/Sectionheader";
import type { MovieDetails } from "../../services/movie.api";

const INITIAL_MOBILE_COUNT = 6;

export default function MovieCast({ movie }: { movie: MovieDetails }) {
  const cast = movie.credits.cast.filter((person) => person.name).slice(0, 14);
  const [showAllMobile, setShowAllMobile] = useState(false);

  if (cast.length === 0) return null;

  const visibleMobileCast = showAllMobile
    ? cast
    : cast.slice(0, INITIAL_MOBILE_COUNT);

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6 sm:pb-10 lg:px-8">
      <SectionHeader title="Cast" />

      {/* Mobile: compact two-column grid, with a short initial preview. */}
      <ul role="list" className="grid grid-cols-2 gap-2.5 sm:hidden">
        {visibleMobileCast.map((person) => (
          <li
            key={person.id}
            className="group flex min-w-0 min-h-[72px] items-center gap-2.5 rounded-xl border border-line bg-white/[0.025] p-3 transition-colors hover:bg-white/[0.045]"
          >
            <div className="h-11 w-11 flex-none overflow-hidden rounded-full bg-card ring-1 ring-line">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-semibold text-muted">
                  {person.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-[18px] text-ink">
                {person.name}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-[17px] text-muted">
                {person.character || "Role not listed"}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Mobile progressive disclosure keeps the page from becoming too long. */}
      {cast.length > INITIAL_MOBILE_COUNT && (
        <button
          type="button"
          onClick={() => setShowAllMobile((current) => !current)}
          aria-expanded={showAllMobile}
          className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-line text-xs font-semibold text-muted transition-colors hover:bg-white/[0.04] hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 sm:hidden"
        >
          {showAllMobile ? (
            <>
              Show less <ChevronUp size={14} aria-hidden="true" />
            </>
          ) : (
            <>
              View all {cast.length} cast members{" "}
              <ChevronDown size={14} aria-hidden="true" />
            </>
          )}
        </button>
      )}

      {/* Tablet and desktop retain the spacious reference-inspired cards. */}
      <ul
        role="list"
        className="hidden grid-cols-2 gap-3 sm:grid xl:grid-cols-4 sm:gap-4"
      >
        {cast.map((person) => (
          <li
            key={person.id}
            className="group flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white/[0.025] p-3 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.045] sm:gap-4 sm:rounded-[22px] sm:px-5 sm:py-3.5"
          >
            <div className="h-12 w-12 flex-none overflow-hidden rounded-full bg-card ring-1 ring-line sm:h-[68px] sm:w-[68px]">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt={`${person.name} portrait`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-white/[0.04] text-base font-semibold text-muted sm:text-xl">
                  {person.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold leading-5 tracking-[-0.02em] text-ink sm:text-[17px] sm:leading-6">
                {person.name}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs leading-5 text-muted sm:mt-1 sm:line-clamp-2 sm:text-[15px]">
                {person.character || "Role not listed"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
