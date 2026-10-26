import SectionHeader from "../ui/Sectionheader";

import type { WatchProviders } from "../../services/movie.api";

export default function WhereToWatch({
  providers,
}: {
  providers: WatchProviders | null;
}) {
  if (!providers) {
    return null;
  }

  const country =
    providers.results.IN ||
    providers.results.US ||
    Object.values(providers.results)[0];

  if (!country) {
    return null;
  }

  const sections = [
    { title: "Stream", providers: country.flatrate ?? [] },
    { title: "Rent", providers: country.rent ?? [] },
    { title: "Buy", providers: country.buy ?? [] },
  ].filter((section) => section.providers.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6 lg:px-8">
      <SectionHeader title="Where to Watch" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-line bg-card p-4"
          >
            <h3 className="mb-3 text-sm font-bold">{section.title}</h3>

            <ul className="flex flex-wrap gap-3">
              {section.providers.map((provider) => (
                <li key={provider.provider_id} className="flex items-center gap-2.5">
                  {provider.logo_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-elevated text-xs">
                      TV
                    </span>
                  )}

                  <span className="text-sm text-muted">{provider.provider_name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {country.link && (
        <a
          href={country.link}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-brand"
        >
          View all options
        </a>
      )}
    </section>
  );
}