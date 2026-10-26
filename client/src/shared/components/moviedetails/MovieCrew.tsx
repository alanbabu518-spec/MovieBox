import type { MovieDetails } from "../../services/movie.api";

export default function MovieCrew({ movie }: { movie: MovieDetails }) {
  const { crew } = movie.credits;

  const sections = [
    {
      title: "Director",
      people: crew.filter((person) => person.job === "Director"),
    },
    {
      title: "Writers",
      people: crew.filter(
        (person) =>
          person.department === "Writing" ||
          person.job === "Writer" ||
          person.job === "Screenplay",
      ),
    },
    {
      title: "Producers",
      people: crew.filter((person) => person.job === "Producer"),
    },
  ].filter((section) => section.people.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-line bg-card p-4"
          >
            <h3 className="text-sm font-bold">{section.title}</h3>

            <ul className="mt-3 space-y-2">
              {section.people.slice(0, 5).map((person) => (
                <li
                  key={`${section.title}-${person.id}-${person.job}`}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-ink">{person.name}</span>
                  <span className="shrink-0 text-xs text-muted">{person.job}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}