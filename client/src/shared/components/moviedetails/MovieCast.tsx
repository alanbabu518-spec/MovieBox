import SectionHeader from "../ui/Sectionheader";

import type { MovieDetails } from "../../services/movie.api";

export default function MovieCast({ movie }: { movie: MovieDetails }) {
  const cast = movie.credits.cast.filter((person) => person.name).slice(0, 14);

  if (cast.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-6 lg:px-8">
      <SectionHeader title="Cast" />

      <ul
        role="list"
        className="scrollbar-none -mx-4 flex snap-x gap-5 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:gap-7 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {cast.map((person) => (
          <li key={person.id} className="w-24 flex-none snap-start text-center sm:w-28">
            <div className="mx-auto aspect-square w-full overflow-hidden rounded-full bg-card ring-1 ring-line">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-lg font-bold text-muted">
                  {person.name.charAt(0)}
                </div>
              )}
            </div>

            <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-tight">
              {person.name}
            </p>

            <p className="mt-0.5 line-clamp-1 text-xs text-muted">
              {person.character || "—"}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}