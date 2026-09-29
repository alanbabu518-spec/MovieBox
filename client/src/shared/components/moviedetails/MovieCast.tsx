import type { MovieDetails } from "../../../shared/services/movie.api";

interface MovieCastProps {
  movie: MovieDetails;
}

export default function MovieCast({
  movie,
}: MovieCastProps) {
  const cast = movie.credits.cast
    .filter((person) => person.name)
    .slice(0, 10);

  if (cast.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
      <div className="mb-7">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{
            color: "var(--primary)",
          }}
        >
          MovieBox
        </p>

        <h2
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Cast
        </h2>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-3">
        {cast.map((person) => (
          <div
            key={person.id}
            className="w-28 flex-none sm:w-32"
          >
            <div className="aspect-3/4 overflow-hidden rounded-lg">
              {person.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                  alt={person.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full items-center justify-center"
                  style={{
                    backgroundColor: "var(--card)",
                  }}
                >
                  <span
                    className="text-xs"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    No Image
                  </span>
                </div>
              )}
            </div>

            <p
              className="mt-3 truncate text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {person.name}
            </p>

            <p
              className="mt-1 truncate text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {person.character || "Unknown"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}