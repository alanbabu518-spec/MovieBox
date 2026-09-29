import type { MovieDetails } from "../../../shared/services/movie.api";

interface MovieCrewProps {
  movie: MovieDetails;
}

export default function MovieCrew({
  movie,
}: MovieCrewProps) {
  const director = movie.credits.crew.filter(
    (person) => person.job === "Director",
  );

  const writers = movie.credits.crew.filter(
    (person) =>
      person.department === "Writing" ||
      person.job === "Writer" ||
      person.job === "Screenplay",
  );

  const producers = movie.credits.crew.filter(
    (person) => person.job === "Producer",
  );

  const sections = [
    {
      title: "Director",
      people: director,
    },
    {
      title: "Writers",
      people: writers,
    },
    {
      title: "Producers",
      people: producers,
    },
  ].filter((section) => section.people.length > 0);

  if (sections.length === 0) {
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
          Crew
        </h2>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div key={section.title}>
            <h3
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {section.title}
            </h3>

            <div className="mt-3 space-y-2">
              {section.people
                .slice(0, 5)
                .map((person) => (
                  <div
                    key={`${section.title}-${person.id}-${person.job}`}
                    className="flex items-center justify-between gap-4 border-b pb-2"
                    style={{
                      borderColor:
                        "var(--border)",
                    }}
                  >
                    <span
                      className="truncate text-sm"
                      style={{
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      {person.name}
                    </span>

                    <span
                      className="shrink-0 text-xs"
                      style={{
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      {person.job}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}