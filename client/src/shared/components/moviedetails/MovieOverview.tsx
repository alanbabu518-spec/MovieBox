import type { MovieDetails } from "../../../shared/services/movie.api";

interface MovieOverviewProps {
  movie: MovieDetails;
}

export default function MovieOverview({
  movie,
}: MovieOverviewProps) {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
      {movie.tagline && (
        <p
          className="max-w-4xl text-sm font-medium uppercase tracking-[0.16em] sm:text-base"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {movie.tagline}
        </p>
      )}

      <div className="mt-8 max-w-4xl">
        <h2
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Overview
        </h2>

        <p
          className="mt-4 text-base leading-8"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          {movie.overview ||
            "No overview is available for this movie."}
        </p>
      </div>
    </section>
  );
}