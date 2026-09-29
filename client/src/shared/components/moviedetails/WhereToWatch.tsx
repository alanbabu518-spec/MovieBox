import type { WatchProviders } from "../../../shared/services/movie.api";

interface WhereToWatchProps {
  providers: WatchProviders | null;
}

export default function WhereToWatch({
  providers,
}: WhereToWatchProps) {
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
    {
      title: "Stream",
      providers: country.flatrate ?? [],
    },
    {
      title: "Rent",
      providers: country.rent ?? [],
    },
    {
      title: "Buy",
      providers: country.buy ?? [],
    },
  ].filter((section) => section.providers.length > 0);

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
          Where to Watch
        </h2>
      </div>

      <div className="space-y-7">
        {sections.map((section) => (
          <div key={section.title}>
            <h3
              className="mb-3 text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {section.title}
            </h3>

            <div className="flex flex-wrap gap-4">
              {section.providers.map(
                (provider) => (
                  <div
                    key={provider.provider_id}
                    className="flex items-center gap-3"
                  >
                    {provider.logo_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        loading="lazy"
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor:
                            "var(--card)",
                        }}
                      >
                        <span className="text-xs">
                          TV
                        </span>
                      </div>
                    )}

                    <span
                      className="text-sm"
                      style={{
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      {provider.provider_name}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
      </div>

      {country.link && (
        <a
          href={country.link}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-sm font-medium"
          style={{
            color: "var(--primary)",
          }}
        >
          View all options
        </a>
      )}
    </section>
  );
}